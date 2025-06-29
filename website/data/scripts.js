// Global variables
let filteredDomains = [...domainsData];
let currentFilter = 'all';
let currentSearchTerm = '';

// GitHub API Cache
const githubCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Language to icon mapping
const languageIcons = {
  'JavaScript': { icon: '📜', color: '#f7df1e' },
  'Python': { icon: '🐍', color: '#3776ab' },
  'HTML': { icon: '📄', color: '#e34f26' },
  'CSS': { icon: '🎨', color: '#264de4' },
  'TypeScript': { icon: '🔷', color: '#3178c6' },
  'Ruby': { icon: '💎', color: '#cc342d' },
  'Java': { icon: '☕', color: '#b07219' },
  'PHP': { icon: '🐘', color: '#777bb4' },
  'Go': { icon: '🐹', color: '#00add8' },
  'C++': { icon: '🛠️', color: '#00599c' },
  'C#': { icon: '♯', color: '#239120' },
  'Rust': { icon: '🦀', color: '#dea584' },
  'default': { icon: '💻', color: 'var(--text-tertiary)' }
};

// DOM elements
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const domainsGrid = document.getElementById('domainsGrid');
const searchResults = document.getElementById('searchResults');
const noResults = document.getElementById('noResults');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Event Listeners
function initializeEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Search functionality
    searchInput.addEventListener('input', debouncedSearch);
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });

    // Clear search
    clearSearchBtn.addEventListener('click', clearSearch);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setFilter(filter);
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }

        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            clearSearch();
        }
    });

    // Search placeholder
    searchInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Search domains... (Press Esc to clear)';
        }
    });

    searchInput.addEventListener('blur', function() {
        this.placeholder = 'Search for your desired domains...';
    });

    // Scroll to top visibility
    window.addEventListener('scroll', function() {
        const scrollBtn = document.querySelector('a[href="#startup"]');
        if (scrollBtn) {
            scrollBtn.style.opacity = window.pageYOffset > 300 ? '1' : '0.7';
        }
    });
}

// Search functionality
function handleSearch(e) {
    currentSearchTerm = e.target.value.toLowerCase().trim();
    clearSearchBtn.classList.toggle('visible', currentSearchTerm.length > 0);
    applyFilters();
}

function clearSearch() {
    searchInput.value = '';
    currentSearchTerm = '';
    clearSearchBtn.classList.remove('visible');
    applyFilters();
    searchInput.focus();
}

// Filter functionality
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    applyFilters();
}

function applyFilters() {
    filteredDomains = domainsData.filter(domain => {
        const matchesSearch = !currentSearchTerm ||
            domain.name.toLowerCase().includes(currentSearchTerm) ||
            domain.description.toLowerCase().includes(currentSearchTerm);

        let matchesFilter = true;
        switch (currentFilter) {
            case 'available':
                matchesFilter = domain.available;
                break;
            case 'unavailable':
                matchesFilter = !domain.available;
                break;
            case 'github':
                matchesFilter = domain.repo !== null;
                break;
            case 'all':
            default:
                matchesFilter = true;
        }

        return matchesSearch && matchesFilter;
    });

    updateSearchResults();
    renderDomains();
}

function updateSearchResults() {
    const total = domainsData.length;
    const filtered = filteredDomains.length;

    let message = '';
    if (currentSearchTerm && currentFilter !== 'all') {
        message = `Found ${filtered} domain${filtered !== 1 ? 's' : ''} matching "${currentSearchTerm}" in ${getFilterLabel(currentFilter)}`;
    } else if (currentSearchTerm) {
        message = `Found ${filtered} domain${filtered !== 1 ? 's' : ''} matching "${currentSearchTerm}"`;
    } else if (currentFilter !== 'all') {
        message = `Showing ${filtered} ${getFilterLabel(currentFilter)} domain${filtered !== 1 ? 's' : ''}`;
    } else {
        message = `Showing all ${total} domains`;
    }

    searchResults.textContent = message;
}

function getFilterLabel(filter) {
    const labels = {
        'available': 'available',
        'unavailable': 'unavailable',
        'github': 'GitHub-linked',
        'all': 'all'
    };
    return labels[filter] || 'all';
}

function clearAllFilters() {
    searchInput.value = '';
    currentSearchTerm = '';
    currentFilter = 'all';
    clearSearchBtn.classList.remove('visible');
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
    });
    applyFilters();
    searchInput.focus();
}

// Domain rendering
function renderDomains() {
    if (filteredDomains.length === 0) {
        domainsGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    domainsGrid.style.display = 'grid';
    noResults.style.display = 'none';

    const domainsHTML = filteredDomains.map(domain => createDomainCard(domain)).join('');
    domainsGrid.innerHTML = domainsHTML;

    // Add fade-in animation
    setTimeout(() => {
        document.querySelectorAll('.domain-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 50);
        });
    }, 10);

    // Load GitHub stats for filtered domains
    loadGitHubStats();
}

function createDomainCard(domain) {
    const highlightedName = highlightText(domain.name, currentSearchTerm);
    const highlightedDescription = highlightText(domain.description, currentSearchTerm);

    return `
                <div class="domain-card">
                    <div class="domain-header">
                        <a href="${domain.url}" target="_blank" class="domain-name">
                            ${highlightedName}
                            <span style="font-size: 0.8em;">🔗</span>
                        </a>
                        <span class="availability-badge ${domain.available ? 'available' : 'unavailable'}">
                            ${domain.available ? '✅ Available' : '❌ Unavailable'}
                        </span>
                    </div>
                    <p class="domain-description">${highlightedDescription}</p>
                    <div class="domain-footer">
                        ${domain.repo ? `
                            <a href="https://github.com/${domain.repo}" target="_blank" class="repo-link">
                                <svg class="github-icon" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                ${domain.repo}
                            </a>
                            <div class="github-stats" id="stats-${domain.repo.replace('/', '-')}">
                                <span class="loading-stats">Loading stats, please wait...</span>
                            </div>
                        ` : `
                            <span class="repo-link" style="color: var(--text-tertiary);">
                                📝 No GitHub repository
                            </span>
                            <div></div>
                        `}
                    </div>
                </div>
            `;
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GitHub API functionality
async function fetchGitHubStats(repo) {
    // Check cache first
    if (githubCache.has(repo)) {
        const cached = githubCache.get(repo);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${repo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const stats = {
            stars: data.stargazers_count,
            forks: data.forks_count,
            language: data.language,
            updated: data.updated_at
        };

        // Cache the result
        githubCache.set(repo, {
            data: stats,
            timestamp: Date.now()
        });
        return stats;
    } catch (error) {
        console.warn(`GitHub API error for ${repo}:`, error);
        return null;
    }
}

async function loadGitHubStats() {
    const domainsWithRepos = filteredDomains.filter(domain => domain.repo);

    for (const domain of domainsWithRepos) {
        try {
            const stats = await fetchGitHubStats(domain.repo);
            updateGitHubStats(domain.repo, stats);
        } catch (error) {
            console.warn(`Failed to load stats for ${domain.repo}:`, error);
            updateGitHubStats(domain.repo, null);
        }
    }
}

function updateGitHubStats(repo, stats) {
    const statsElement = document.getElementById(`stats-${repo.replace('/', '-')}`);
    if (!statsElement) return;

    if (stats) {
        const {
            icon,
            color
        } = languageIcons[stats.language] || languageIcons.default;
        statsElement.innerHTML = `
                    <div class="github-stat">
                        <span>⭐</span>
                        <span>${formatNumber(stats.stars)}</span>
                    </div>
                    <div class="github-stat">
                        <span>🍴</span>
                        <span>${formatNumber(stats.forks)}</span>
                    </div>
                    ${stats.language ? `
                        <div class="github-stat">
                            <span style="color: ${color}">${icon}</span>
                            <span>${stats.language}</span>
                        </div>
                    ` : ''}
                `;
    } else {
        statsElement.innerHTML = '<span style="color: var(--text-tertiary);"><i>Stats unavailable</i></span>';
    }
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
const debouncedSearch = debounce(handleSearch, 300);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    renderDomains();
    initializeEventListeners();
});

// Error handling for failed network requests
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Handle online/offline status
window.addEventListener('online', function() {
    console.log('Connection restored');
    loadGitHubStats();
});

window.addEventListener('offline', function() {
    console.log('Connection lost');
});
