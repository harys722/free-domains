#!/usr/bin/env node
/**
 * Regenerates the domains table and the count line in README.md
 * using website/data/subdomains.json as the single source of truth.
 *
 * Only touches:
 *   - the content between <!-- START LIST --> and <!-- END LIST -->
 *   - the "All Domains Services / Available / Unavailable" count line
 * Everything else in README.md (badges, header, license, etc.) is left untouched.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'website', 'data', 'subdomains.json');
const README_PATH = path.join(__dirname, '..', '..', 'README.md');

const START_MARKER = '<!-- START LIST -->';
const END_MARKER = '<!-- END LIST -->';

function validate(entries) {
  if (!Array.isArray(entries)) {
    throw new Error('subdomains.json must be a JSON array');
  }
  entries.forEach((e, i) => {
    const label = e && e.name ? e.name : `#${i}`;
    ['name', 'url', 'description', 'available'].forEach((field) => {
      if (!(field in e)) {
        throw new Error(`Entry "${label}" is missing required field "${field}"`);
      }
    });
    if (typeof e.available !== 'boolean') {
      throw new Error(`Entry "${label}": "available" must be true or false`);
    }
    if (e.repo !== null && e.repo !== undefined && typeof e.repo !== 'string') {
      throw new Error(`Entry "${label}": "repo" must be a string like "owner/repo" or null`);
    }
    if (typeof e.name !== 'string' || !e.name.trim()) {
      throw new Error(`Entry "${label}": "name" must be a non-empty string`);
    }
    if (typeof e.url !== 'string' || !e.url.trim()) {
      throw new Error(`Entry "${label}": "url" must be a non-empty string`);
    }
  });
}

function buildRow(d) {
  const domainCol = `[${d.name}](${d.url})`;
  const aboutCol = d.description;
  const repoCol = d.repo
    ? `[${d.repo}](https://github.com/${d.repo}) <br><br> ![GitHub stars](https://img.shields.io/github/stars/${d.repo}?style=flat&label=Stars) ![GitHub forks](https://img.shields.io/github/forks/${d.repo}?style=flat&label=Forks)`
    : '—';
  const availCol = d.available ? '✅' : '❌';
  return ` | ${domainCol} | ${aboutCol} | ${repoCol} | ${availCol} |`;
}

function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`❌ Could not find ${DATA_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  let entries;
  try {
    entries = JSON.parse(raw);
  } catch (e) {
    console.error('❌ subdomains.json is not valid JSON:', e.message);
    process.exit(1);
  }

  try {
    validate(entries);
  } catch (e) {
    console.error('❌ subdomains.json validation failed:', e.message);
    process.exit(1);
  }

  // Available entries first, unavailable last. Stable sort preserves
  // the relative order you listed them in within each group.
  const sorted = [...entries].sort((a, b) => {
    if (a.available === b.available) return 0;
    return a.available ? -1 : 1;
  });

  const total = entries.length;
  const available = entries.filter((e) => e.available).length;
  const unavailable = total - available;

  const tableHeader = ' | Domain | About | Repository | Availability | \n |--------|-------|------------|----------------|';
  const rows = sorted.map(buildRow).join('\n');
  const newBlock = `${START_MARKER}\n${tableHeader}\n${rows}\n ${END_MARKER}`;

  if (!fs.existsSync(README_PATH)) {
    console.error(`❌ Could not find ${README_PATH}`);
    process.exit(1);
  }

  let readme = fs.readFileSync(README_PATH, 'utf8');

  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    console.error('❌ Could not find <!-- START LIST --> / <!-- END LIST --> markers in README.md');
    process.exit(1);
  }

  const before = readme.slice(0, startIdx);
  const after = readme.slice(endIdx + END_MARKER.length);
  readme = `${before}${newBlock}${after}`;

  const totalPattern = /All Domains Services: \*\*\d+\*\*/;
  const availablePattern = /✅ Available: \*\*\d+\*\*/;
  const unavailablePattern = /❌ Unavailable: \*\*\d+\*\*/;

  if (!totalPattern.test(readme) || !availablePattern.test(readme) || !unavailablePattern.test(readme)) {
    console.warn('⚠️  Warning: could not find one or more count line patterns to update (table was still updated).');
  }

  readme = readme.replace(totalPattern, `All Domains Services: **${total}**`);
  readme = readme.replace(availablePattern, `✅ Available: **${available}**`);
  readme = readme.replace(unavailablePattern, `❌ Unavailable: **${unavailable}**`);

  fs.writeFileSync(README_PATH, readme, 'utf8');
  console.log(`✅ README.md updated — Total: ${total}, Available: ${available}, Unavailable: ${unavailable}`);
}

main();