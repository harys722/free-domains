(() => {
    const home = new URL('../', document.currentScript.src);
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let preference;
    try {
        preference = localStorage.getItem('theme');
    } catch {
        // Storage can be unavailable in private or embedded browsing.
    }

    const icons = {
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
        moon: '<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>',
        github: '<path fill="currentColor" stroke="none" d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .37 1.8 1.71 3.25.82.1-.73.4-1.23.72-1.51-2.48-.28-5.1-1.24-5.1-5.5 0-1.21.43-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .94-.3 3.06 1.14a10.6 10.6 0 0 1 5.57 0C16.93 5 17.86 5.3 17.86 5.3c.61 1.53.23 2.66.12 2.94.71.78 1.14 1.77 1.14 2.98 0 4.28-2.62 5.22-5.11 5.5.4.36.76 1.05.76 2.12v3.12c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/>',
        arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
        'arrow-up-right': '<path d="M6 18 18 6M7 6h11v11"/>',
        back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
        signpost: '<path d="M12 3v18M5 5h12l3 3-3 3H5V5Zm7 8H6l-3 3 3 3h6"/>',
    };

    function icon(name) {
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
    }

    function applyTheme() {
        const theme = preference === 'dark' || preference === 'light'
            ? preference
            : (systemTheme.matches ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
            toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        }
    }

    function renderSharedLayout() {
        const brand = `<a class="brand" href="${home.href}"><span class="brand-mark"><img src="${new URL('assets/globe.png', home).href}" width="24" height="24" alt=""></span><span>Free Domains</span></a>`;
        const directory = document.getElementById('domains') ? '#domains' : new URL('#domains', home).href;
        document.querySelector('[data-site-header]').innerHTML = `
            <div class="site-bar">
                ${brand}
                <nav class="site-nav" aria-label="Main navigation">
                    <a class="nav-directory" href="${directory}">Explore Domains</a>
                    <a class="nav-github" href="https://github.com/harys722/free-domains" target="_blank" rel="noopener noreferrer">${icon('github')}<span>GitHub</span></a>
                    <button type="button" class="theme-toggle" id="themeToggle" aria-label="Dark theme"></button>
                </nav>
            </div>`;
        const year = new Date().getFullYear();
        document.querySelector('[data-site-footer]').innerHTML = `
            <div class="site-bar">
                ${brand}
                <p class="copyright">© 2025${year > 2025 ? '–' + year : ''} Free Domains. All rights reserved.</p>
                <p class="credit">Project by <a href="https://harys.is-a.dev/" target="_blank" rel="noopener noreferrer">Harys</a>.</p>
            </div>`;
        document.getElementById('themeToggle').addEventListener('click', () => {
            preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem('theme', preference);
            } catch {
                // The preference still applies to the current page.
            }
            applyTheme();
        });
        applyTheme();
    }

    function initializeErrorPage() {
        document.querySelector('[data-go-back]')?.addEventListener('click', event => {
            if (history.length > 1) {
                event.preventDefault();
                history.back();
            }
        });
        const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        const recent = [];
        const title = document.querySelector('.error-title');
        const original = title.textContent;
        let resetTitle;
        document.addEventListener('keydown', event => {
            recent.push(event.code);
            if (recent.length > sequence.length) recent.shift();
            if (recent.length === sequence.length && recent.every((key, i) => key === sequence[i])) {
                recent.length = 0;
                clearTimeout(resetTitle);
                title.textContent = '🎉 You found the secret! 🎉';
                title.classList.add('is-celebrating');
                resetTitle = setTimeout(() => {
                    title.textContent = original;
                    title.classList.remove('is-celebrating');
                }, 3000);
            }
        });
    }

    function initializeSite() {
        renderSharedLayout();
        document.querySelectorAll('[data-icon]').forEach(element => {
            element.innerHTML = icon(element.dataset.icon);
        });
        if (document.querySelector('.error-main')) initializeErrorPage();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(new URL('sw.js', home)).catch(error => {
                console.warn('Offline support could not be initialized.', error);
            });
        }
    }

    applyTheme();
    systemTheme.addEventListener('change', applyTheme);
    window.addEventListener('storage', event => {
        if (event.key === 'theme' || event.key === null) {
            preference = event.newValue;
            applyTheme();
        }
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSite, { once: true });
    } else {
        initializeSite();
    }
})();
