let filteredDomains = [...domainsData], currentFilter = 'all', currentSearchTerm = '', currentLink = null, currentView = localStorage.getItem('domainView') || 'gallery';
        const searchInput = document.getElementById('searchInput'),
              clearSearchBtn = document.getElementById('clearSearch'),
              domainsGrid = document.getElementById('domainsGrid'),
              searchResults = document.getElementById('searchResults'),
              noResults = document.getElementById('noResults'),
              themeToggle = document.getElementById('themeToggle'),
              themeIcon = document.getElementById('themeIcon'),
              scrollTop = document.getElementById('scrollTop'),
              loadingScreen = document.getElementById('loadingScreen'),
              linkConfirmDialog = document.getElementById('linkConfirmDialog'),
              confirmLinkUrl = document.getElementById('confirmLinkUrl'),
              confirmLinkBtn = document.getElementById('confirmLink'),
              cancelLinkBtn = document.getElementById('cancelLink'),
              listViewBtn = document.getElementById('listViewBtn'),
              galleryViewBtn = document.getElementById('galleryViewBtn'),
              resetViewBtn = document.getElementById('resetViewBtn');
        function initializeTheme() {
            const theme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        function toggleTheme() {
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        function handleScroll() {
            const pos = window.scrollY;
            themeToggle.classList.toggle('scrolled', pos > 100);
            scrollTop.classList.toggle('visible', pos > 100);
        }
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        function hideLoadingScreen() {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.classList.remove('loading');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.querySelector('header').classList.add('reveal');
                    document.querySelector('main').classList.add('reveal');
                }, 600);
            }, 5000);
        }
        function showLinkConfirmation(e) {
            e.preventDefault();
            e.stopPropagation();
            const link = e.target.closest('a[target="_blank"]');
            if (!link) return;
            confirmLinkUrl.textContent = link.getAttribute('href');
            linkConfirmDialog.style.display = 'block';
            currentLink = link.getAttribute('href');
        }
        function hideLinkConfirmation() {
            linkConfirmDialog.style.display = 'none';
            currentLink = null;
        }
        function attachLinkEvents() {
            document.querySelectorAll('a[target="_blank"]').forEach(link => {
                link.classList.add('external-link');
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                newLink.addEventListener('click', showLinkConfirmation);
            });
        }
        function attachImageEvents() {
            document.querySelectorAll('img[src*="img.shields.io"]').forEach(img => {
                img.addEventListener('dblclick', e => {
                    e.preventDefault();
                    e.stopPropagation();
                });
                img.addEventListener('dragstart', e => e.preventDefault());
            });
        }
        function initializeView() {
            setView(currentView);
            listViewBtn.classList.toggle('active', currentView === 'list');
            galleryViewBtn.classList.toggle('active', currentView === 'gallery');
        }
        function setView(view) {
            currentView = view;
            domainsGrid.classList.toggle('list', view === 'list');
            domainsGrid.classList.toggle('gallery', view === 'gallery');
            listViewBtn.classList.toggle('active', view === 'list');
            galleryViewBtn.classList.toggle('active', view === 'gallery');
            localStorage.setItem('domainView', view);
        }
        function resetView() {
            setView('gallery');
            localStorage.removeItem('domainView');
        }
        function initializeEventListeners() {
            themeToggle.addEventListener('click', toggleTheme);
            scrollTop.addEventListener('click', scrollToTop);
            window.addEventListener('scroll', handleScroll);
            searchInput.addEventListener('input', debounce(handleSearch, 300));
            searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
            clearSearchBtn.addEventListener('click', clearSearch);
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => setFilter(btn.getAttribute('data-filter')));
            });
            listViewBtn.addEventListener('click', () => setView('list'));
            galleryViewBtn.addEventListener('click', () => setView('gallery'));
            resetViewBtn.addEventListener('click', resetView);
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', e => {
                    e.preventDefault();
                    document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
            attachLinkEvents();
            attachImageEvents();
            document.addEventListener('click', e => {
                if (!linkConfirmDialog.contains(e.target) && !e.target.closest('a[target="_blank"]')) hideLinkConfirmation();
            });
            confirmLinkBtn.addEventListener('click', () => {
                if (currentLink) {
                    window.open(currentLink, '_blank', 'noopener,noreferrer');
                    hideLinkConfirmation();
                }
            });
            cancelLinkBtn.addEventListener('click', hideLinkConfirmation);
            document.addEventListener('dragstart', e => {
                if (e.target.matches('img[src*="img.shields.io"], .domain-card, .filter-btn, .btn, .theme-toggle, .scroll-top, .clear-search')) e.preventDefault();
            });
            document.addEventListener('keydown', e => {
                if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || e.key === '/') {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
                if (e.key === 'Escape') {
                    if (document.activeElement === searchInput) clearSearch();
                    hideLinkConfirmation();
                }
            });
            searchInput.addEventListener('focus', () => { if (!searchInput.value) searchInput.placeholder = 'Discover domains... (Press Esc to clear)'; });
            searchInput.addEventListener('blur', () => searchInput.placeholder = 'Discover your ideal domain...');
        }
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
        function setFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-filter') === filter));
            applyFilters();
        }
        function applyFilters() {
            filteredDomains = domainsData.filter(domain => {
                const matchesSearch = !currentSearchTerm ||
                    domain.name.toLowerCase().includes(currentSearchTerm) ||
                    domain.description.toLowerCase().includes(currentSearchTerm);
                let matchesFilter = true;
                switch (currentFilter) {
                    case 'available': matchesFilter = domain.available; break;
                    case 'unavailable': matchesFilter = !domain.available; break;
                    case 'github': matchesFilter = domain.repo !== null; break;
                }
                return matchesSearch && matchesFilter;
            });
            updateSearchResults();
            renderDomains();
        }
        function updateSearchResults() {
            const total = domainsData.length, filtered = filteredDomains.length;
            let message = currentSearchTerm && currentFilter !== 'all' ? `Found ${filtered} domain${filtered !== 1 ? 's' : ''} matching "${currentSearchTerm}" in ${getFilterLabel(currentFilter)}` :
                          currentSearchTerm ? `Found ${filtered} domain${filtered !== 1 ? 's' : ''} matching "${currentSearchTerm}"` :
                          currentFilter !== 'all' ? `Showing ${filtered} ${getFilterLabel(currentFilter)} domain${filtered !== 1 ? 's services' : ''}` :
                          `Showing all ${total} domains services`;
            searchResults.textContent = message;
        }
        function getFilterLabel(filter) {
            return { available: 'available', unavailable: 'unavailable', github: 'GitHub-linked', all: 'all' }[filter] || 'all';
        }
        function clearAllFilters() {
            searchInput.value = '';
            currentSearchTerm = '';
            currentFilter = 'all';
            clearSearchBtn.classList.remove('visible');
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all'));
            applyFilters();
            searchInput.focus();
        }
        function renderDomains() {
            if (filteredDomains.length === 0) {
                domainsGrid.style.display = 'none';
                noResults.style.display = 'block';
                return;
            }
            domainsGrid.style.display = 'grid';
            noResults.style.display = 'none';
            domainsGrid.innerHTML = filteredDomains.map(createDomainCard).join('');
            setTimeout(() => {
                document.querySelectorAll('.domain-card').forEach((card, i) => {
                    setTimeout(() => card.classList.add('fade-in'), i * 50);
                });
                attachLinkEvents();
                attachImageEvents();
            }, 10);
        }
        function createDomainCard(domain) {
            const highlightedName = highlightText(domain.name, currentSearchTerm);
            const highlightedDescription = highlightText(domain.description, currentSearchTerm);
            return `
                <div class="domain-card">
                    <div class="domain-header">
                        <a href="${domain.url}" target="_blank" class="domain-name external-link">${highlightedName}<span style="font-size: 0.8em;">🔗</span></a>
                        <span class="availability-badge ${domain.available ? 'available' : 'unavailable'}">${domain.available ? '✅ Available' : '❌ Unavailable'}</span>
                    </div>
                    <p class="domain-description">${highlightedDescription}</p>
                    <div class="domain-footer">
                        ${domain.repo ? `
                            <a href="https://github.com/${domain.repo}" target="_blank" class="repo-link external-link">
                                <svg class="github-icon" viewBox="0 0 24 24"><path d="M12 0c-6.63 0-12 5.37-12 12 0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                                ${domain.repo}
                            </a>
                            <div class="github-stats" id="stats-${domain.repo.replace('/', '-')}">
                                <div class="github-stat"><img src="https://img.shields.io/github/stars/${domain.repo}?style=flat&label=Stars" alt="Stars"></div>
                                <div class="github-stat"><img src="https://img.shields.io/github/forks/${domain.repo}?style=flat&label=Forks" alt="Forks"></div>
                                <div class="github-stat"><img src="https://img.shields.io/github/languages/top/${domain.repo}?style=flat" alt="Forks"></div>
                            </div>
                        ` : `
                            <span class="repo-link" style="color: var(--text-tertiary);">
                            <svg class="github-icon" viewBox="0 0 24 24"><path d="M12 0c-6.63 0-12 5.37-12 12 0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/><line x1="4" y1="20" x2="20" y2="4" stroke="red" stroke-width="3" stroke-linecap="round"/></svg>
                            No GitHub repository</span>
                            <div></div>
                        `}
                    </div>
                </div>
            `;
        }
        function highlightText(text, searchTerm) {
            if (!searchTerm) return text;
            return text.replace(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<span class="highlight">$1</span>');
        }
        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        }
        document.addEventListener('DOMContentLoaded', () => {
            initializeTheme();
            initializeView();
            renderDomains();
            initializeEventListeners();
            hideLoadingScreen();
        });
        window.addEventListener('error', e => console.error('Global error:', e.error));
