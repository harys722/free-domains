        // Theme Toggle Functionality
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const body = document.body;

        // Check for saved theme preference or default to 'light'
        const currentTheme = localStorage.getItem('theme') || 'light';
        body.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            body.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
            localStorage.setItem('theme', newTheme);
        });

        function updateThemeIcon(theme) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        // GitHub API Cache
        const githubCache = new Map();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        // Fetch GitHub repository data
        async function fetchGitHubData(repo) {
            // Check cache first
            const cacheKey = repo;
            const cached = githubCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.data;
            }

            try {
                const response = await fetch(`https://api.github.com/repos/${repo}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                const result = {
                    stars: data.stargazers_count,
                    forks: data.forks_count
                };

                // Cache the result
                githubCache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });

                return result;
            } catch (error) {
                console.error(`Error fetching GitHub data for ${repo}:`, error);
                return null;
            }
        }

        // Format number for display
        function formatNumber(num) {
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k';
            }
            return num.toString();
        }

        // Render Domains
        async function renderDomains() {
            const domainsGrid = document.getElementById('domainsGrid');
            domainsGrid.innerHTML = '';

            for (const domain of domainsData) {
                const domainCard = document.createElement('div');
                domainCard.className = 'domain-card fade-in';
                
                // Create initial card HTML
                domainCard.innerHTML = `
                    <div class="domain-header">
                        <a href="${domain.url}" target="_blank" class="domain-name">
                            ${domain.name}
                            <span style="font-size: 0.8em;">🔗</span>
                        </a>
                        <span class="availability-badge ${domain.available ? 'available' : 'unavailable'}">
                            ${domain.available ? '✅ Available' : '❌ Unavailable'}
                        </span>
                    </div>
                    <p class="domain-description">${domain.description}</p>
                    <div class="domain-footer">
                        ${domain.repo ? `
                            <a href="https://github.com/${domain.repo}" target="_blank" class="repo-link">
                                <svg class="github-icon" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                </svg>
                                ${domain.repo}
                            </a>
                        ` : '<span class="repo-link">—</span>'}
                        <div class="github-stats" id="stats-${domain.repo ? domain.repo.replace('/', '-') : 'no-repo'}">
                            ${domain.repo ? '<span class="loading-stats">Loading stats...</span>' : ''}
                        </div>
                    </div>
                `;
                
                domainsGrid.appendChild(domainCard);

                // Fetch GitHub stats if repo exists
                if (domain.repo) {
                    try {
                        const githubData = await fetchGitHubData(domain.repo);
                        const statsElement = document.getElementById(`stats-${domain.repo.replace('/', '-')}`);
                        
                        if (githubData && statsElement) {
                            statsElement.innerHTML = `
                                <div class="github-stat">
                                    ⭐ ${formatNumber(githubData.stars)}
                                </div>
                                <div class="github-stat">
                                    🍴 ${formatNumber(githubData.forks)}
                                </div>
                            `;
                        } else if (statsElement) {
                            statsElement.innerHTML = '<span class="loading-stats">Stats unavailable</span>';
                        }
                    } catch (error) {
                        console.error(`Error loading stats for ${domain.repo}:`, error);
                        const statsElement = document.getElementById(`stats-${domain.repo.replace('/', '-')}`);
                        if (statsElement) {
                            statsElement.innerHTML = '<span class="loading-stats">Stats unavailable</span>';
                        }
                    }
                }
            }
        }

        // Initialize
        renderDomains();

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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
