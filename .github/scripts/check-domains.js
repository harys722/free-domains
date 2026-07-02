#!/usr/bin/env node
/**
 * Monthly domain availability checker.
 *
 * - Only checks entries where available: true
 * - Pings each URL up to 3 times before marking as suspect
 * - Opens a single GitHub Issue listing all suspect services
 * - If an open issue from a previous run already exists, adds a comment instead of opening a duplicate
 * - Requires env vars: GITHUB_TOKEN, GITHUB_REPOSITORY (both provided automatically in Actions)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_PATH = path.join(__dirname, '..', '..', 'website', 'data', 'subdomains.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY; // e.g. "harys722/free-domains"
const ISSUE_TITLE_PREFIX = '🔍 Monthly check:';

// Cloudflare / parking page fingerprints that return 200 but mean the service is gone
const DEAD_PAGE_FINGERPRINTS = [
  'This domain is for sale',
  'Domain not configured',
  'This site can\'t be reached',
  'ERR_NAME_NOT_RESOLVED',
  'Cloudflare Ray ID',
  'DNS_PROBE_FINISHED_NXDOMAIN',
  'is currently unable to handle this request',
  'parked domain',
  'buy this domain',
  'domain has expired',
];

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;
const REQUEST_TIMEOUT_MS = 10000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUrl(urlString) {
  return new Promise((resolve) => {
    const url = new URL(urlString);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.get(
      urlString,
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          'User-Agent': 'free-domains-checker/1.0 (github.com/harys722/free-domains)',
        },
      },
      (res) => {
        const status = res.statusCode;
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
          // Don't buffer entire huge pages
          if (body.length > 50000) res.destroy();
        });
        res.on('end', () => resolve({ status, body, error: null }));
        res.on('close', () => resolve({ status, body, error: null }));
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: null, body: '', error: 'timeout' });
    });

    req.on('error', (err) => {
      resolve({ status: null, body: '', error: err.message });
    });
  });
}

function friendlyError(message) {
  if (!message) return 'Unknown error';
  if (message === 'timeout') return 'Request timed out';
  if (message.includes('ENOTFOUND')) return 'Domain not found (DNS failure)';
  if (message.includes('ECONNREFUSED')) return 'Connection refused';
  if (message.includes('ECONNRESET')) return 'Connection reset';
  if (message.includes('ETIMEDOUT')) return 'Connection timed out';
  if (message.includes('certificate has expired')) return 'SSL certificate expired';
  if (message.includes('EPROTO') || message.includes('SSL') || message.includes('ssl')) return 'SSL handshake failed';
  if (message.includes('ENOENT')) return 'Network unreachable';
  return message.length > 60 ? message.slice(0, 60) + '\u2026' : message;
}

function isDeadResponse(result) {
  if (result.error) return friendlyError(result.error);
  const { status, body } = result;

  // Treat these status codes as dead
  if ([404, 410, 500, 502, 503, 521, 522, 523, 524].includes(status)) {
    return `HTTP ${status}`;
  }

  // 200 but page content looks like a parked/dead domain
  if (status === 200 || status === 301 || status === 302) {
    const lowerBody = body.toLowerCase();
    for (const fingerprint of DEAD_PAGE_FINGERPRINTS) {
      if (lowerBody.includes(fingerprint.toLowerCase())) {
        return `Parked or error page detected ("${fingerprint}")`;
      }
    }
  }

  return null; // looks alive
}

async function checkUrl(url) {
  let lastReason = null;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    const result = await fetchUrl(url);
    const reason = isDeadResponse(result);
    if (!reason) return null; // alive on this attempt
    lastReason = reason;
    if (attempt < RETRY_ATTEMPTS) {
      console.log(`    Attempt ${attempt} failed (${reason}), retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
  return lastReason; // failed all attempts
}

function githubApi(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'free-domains-checker/1.0',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function findExistingIssue() {
  const [owner, repo] = GITHUB_REPOSITORY.split('/');
  const res = await githubApi('GET', `/repos/${owner}/${repo}/issues?state=open&labels=automated-check&per_page=10`);
  if (!Array.isArray(res.data)) return null;
  return res.data.find((issue) => issue.title.startsWith(ISSUE_TITLE_PREFIX)) || null;
}

async function openIssue(title, body) {
  const [owner, repo] = GITHUB_REPOSITORY.split('/');
  const res = await githubApi('POST', `/repos/${owner}/${repo}/issues`, {
    title,
    body,
    labels: ['automated-check'],
  });
  return res.data.html_url;
}

async function addComment(issueNumber, body) {
  const [owner, repo] = GITHUB_REPOSITORY.split('/');
  await githubApi('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body });
}

function buildIssueBody(suspects, checkDate) {
  const rows = suspects
    .map((s) => {
      const repoCol = s.repo
        ? `[${s.repo}](https://github.com/${s.repo})`
        : '—';
      return `| [${s.name}](${s.url}) | \`${s.url}\` | ${repoCol} | ${s.reason} |`;
    })
    .join('\n');

  return `The following services failed reachability checks on **${checkDate}**. Please verify each one manually and update \`website/data/subdomains.json\` if needed.

| Service | URL | Repository | Failure Reason |
|---------|-----|------------|----------------|
${rows}

**How to resolve:**
1. Visit each URL yourself to confirm whether the service is genuinely down
2. If confirmed unavailable, set \`"available": false\` for that entry in \`website/data/subdomains.json\`
3. If it was a false alarm (service is fine), no action needed — close or ignore this issue
4. Close this issue once all entries have been reviewed

*This issue was opened automatically by the monthly domain checker. Only services marked \`available: true\` in \`subdomains.json\` are checked.*`;
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is not set');
    process.exit(1);
  }
  if (!GITHUB_REPOSITORY) {
    console.error('❌ GITHUB_REPOSITORY environment variable is not set');
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const entries = JSON.parse(raw);

  // Only check entries marked as available
  const toCheck = entries.filter((e) => e.available === true);
  console.log(`Checking ${toCheck.length} available services (skipping ${entries.length - toCheck.length} unavailable)...\n`);

  const suspects = [];
  const checkDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  for (const entry of toCheck) {
    process.stdout.write(`  Checking ${entry.name} (${entry.url})... `);
    const reason = await checkUrl(entry.url);
    if (reason) {
      console.log(`❌ SUSPECT — ${reason}`);
      suspects.push({ name: entry.name, url: entry.url, repo: entry.repo || null, reason });
    } else {
      console.log('✅ OK');
    }
  }

  console.log(`\nDone. ${suspects.length} suspect service(s) found out of ${toCheck.length} checked.`);

  if (suspects.length === 0) {
    console.log('No issues to report — no GitHub issue will be opened.');
    return;
  }

  // Check for an existing open issue to avoid duplicates
  console.log('\nChecking for existing open issue...');
  const existing = await findExistingIssue();
  const title = `${ISSUE_TITLE_PREFIX} ${suspects.length} service${suspects.length !== 1 ? 's' : ''} may be unavailable (${checkDate})`;
  const body = buildIssueBody(suspects, checkDate);

  if (existing) {
    console.log(`Found existing open issue #${existing.number} — adding a comment instead of opening a duplicate.`);
    await addComment(existing.number, `## 🔄 Re-check on ${checkDate}\n\n${body}`);
    console.log(`✅ Comment added to issue #${existing.number}: ${existing.html_url}`);
  } else {
    console.log('No existing open issue found — opening a new one.');
    const url = await openIssue(title, body);
    console.log(`✅ Issue opened: ${url}`);
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});