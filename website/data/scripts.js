(() => {
    const byId = id => document.getElementById(id);
    const search = byId('searchInput');
    const clearSearch = byId('clearSearch');
    const searchTools = byId('searchTools');
    const searchFilters = byId('searchFilters');
    const filterToggle = byId('filterToggle');
    const resultArea = byId('collectionResults');
    const grid = byId('domainsGrid');
    const results = byId('searchResults');
    const noResults = byId('noResults');
    const loader = byId('loadingScreen');
    const loadError = byId('loadError');
    const retry = byId('retryLoad');
    const count = byId('domainCountBadge');
    const filters = document.querySelectorAll('.filter-btn[data-filter]');
    const listButton = byId('listViewBtn');
    const galleryButton = byId('galleryViewBtn');
    const dialog = byId('linkConfirmDialog');
    const catalogueURL = new URL('subdomains.json', document.currentScript.src);
    const filterLabels = { available: 'available', unavailable: 'unavailable', github: 'On GitHub', saved: 'Saved' };
    const bookmarkTemplate = byId('bookmarkTemplate');
    const bookmarkKey = 'free-domains.bookmarks';
    let bookmarks = readBookmarks();
    let cards = [];
    let filter = 'all';
    let state = 'idle';
    let linkToOpen = null;

    function readBookmarks() {
        try {
            const values = JSON.parse(localStorage.getItem(bookmarkKey));
            return new Set(Array.isArray(values) ? values.filter(value => typeof value === 'string') : []);
        } catch {
            return new Set();
        }
    }

    function renderBookmark(button) {
        const name = button.dataset.domain;
        const saved = bookmarks.has(name);
        button.setAttribute('aria-pressed', String(saved));
        button.title = (saved ? 'Remove bookmark for ' : 'Bookmark ') + name;
    }

    function element(tag, className, text) {
        const node = document.createElement(tag);
        node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function externalLink(text, href, className) {
        const link = element('a', className + ' external-link', text);
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        return link;
    }

    function repositoryDetails(repo) {
        const footer = element('div', 'domain-footer');
        const repoPath = repo?.split('/').map(encodeURIComponent).join('/');
        const link = repo
            ? externalLink(repo, 'https://github.com/' + repoPath, 'repo-link')
            : element('span', 'repo-link no-repository', 'No GitHub repository');
        const svgNS = 'http://www.w3.org/2000/svg';
        const icon = document.createElementNS(svgNS, 'svg');
        icon.setAttribute('class', 'github-icon');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('width', '16');
        icon.setAttribute('height', '16');
        icon.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('d', 'M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.31c0 .32.22.69.83.57A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0Z');
        icon.append(path);
        link.prepend(icon);
        footer.append(link);
        if (!repo) return footer;
        const stats = element('div', 'github-stats');
        for (const [metric, label] of [['stars', 'Stars'], ['forks', 'Forks'], ['languages/top', 'Top language']]) {
            const img = document.createElement('img');
            img.alt = label;
            img.height = 20;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.fetchPriority = 'low';
            img.crossOrigin = 'anonymous';
            img.draggable = false;
            const url = new URL('https://img.shields.io/github/' + metric + '/' + repoPath);
            url.searchParams.set('style', 'flat');
            if (metric !== 'languages/top') url.searchParams.set('label', label);
            img.src = url.href;
            stats.append(img);
        }
        footer.append(stats);
        return footer;
    }

    function createCard(domain) {
        const card = element('article', 'domain-card');
        const heading = element('h3', 'domain-heading');
        const name = externalLink(domain.name, domain.url, 'domain-name');
        const availability = domain.available ? 'Available' : 'Unavailable';
        const badge = element('span', 'availability-badge ' + availability.toLowerCase(), availability);
        const description = element('p', 'domain-description', domain.description);
        heading.append(name);
        const bookmark = bookmarkTemplate.content.firstElementChild.cloneNode(true);
        bookmark.dataset.domain = domain.name;
        bookmark.setAttribute('aria-label', 'Bookmark ' + domain.name);
        renderBookmark(bookmark);
        const identity = element('div', 'domain-identity');
        identity.append(heading, badge);
        card.append(identity, description, repositoryDetails(domain.repo), bookmark);
        return { domain, card, name, description, bookmark, highlighted: '' };
    }

    function orderedCards() {
        const byName = new Map(cards.map(item => [item.domain.name, item]));
        const saved = [];
        for (const name of bookmarks) {
            if (byName.has(name)) saved.push(byName.get(name));
        }
        return saved.concat(cards.filter(item => !bookmarks.has(item.domain.name)));
    }

    function moveCard(card, before) {
        if (card.nextElementSibling === before) return;
        if (grid.moveBefore) grid.moveBefore(card, before);
        else {
            const focused = document.activeElement;
            grid.insertBefore(card, before);
            if (card.contains(focused)) focused.focus({ preventScroll: true });
        }
    }

    function highlight(node, text, pattern) {
        if (!pattern) {
            node.textContent = text;
            return;
        }
        const fragments = [];
        let start = 0;
        for (const match of text.matchAll(pattern)) {
            fragments.push(text.slice(start, match.index), element('mark', 'highlight', match[0]));
            start = match.index + match[0].length;
        }
        fragments.push(text.slice(start));
        node.replaceChildren(...fragments);
    }

    function resultMessage(visible, term) {
        if (filter === 'saved') {
            const noun = visible === 1 ? 'service' : 'services';
            return `${visible} saved ${noun}` + (term ? ` matching "${term}"` : '');
        }
        if (filter === 'github') {
            const services = visible === 1 ? 'service' : 'services';
            return term ? `Found ${visible} ${services} on GitHub matching "${term}"`
                : `Showing ${visible} ${services} with a GitHub repository`;
        }
        const noun = visible === 1 ? 'domain' : 'domains';
        if (term) {
            const scope = filter === 'all' ? '' : ' in ' + filterLabels[filter];
            return 'Found ' + visible + ' ' + noun + ' matching "' + term + '"' + scope;
        }
        if (filter !== 'all') {
            return 'Showing ' + visible + ' ' + filterLabels[filter] + ' ' + (visible === 1 ? 'domain' : 'domains services');
        }
        return 'Showing all ' + visible + ' domains services';
    }

    function restoreSearchFromURL() {
        const params = new URLSearchParams(location.search);
        search.value = params.get('q') || '';
        const selected = params.get('filter');
        setFilter(Object.hasOwn(filterLabels, selected) ? selected : 'all');
    }

    function syncSearchURL(term) {
        const url = new URL(location.href);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
        if (term) url.searchParams.set('q', term);
        else url.searchParams.delete('q');
        if (filter === 'all') url.searchParams.delete('filter');
        else url.searchParams.set('filter', filter);
        if (url.href !== location.href) history.replaceState(history.state, '', url);
    }

    function updateResults() {
        const term = search.value.trim();
        syncSearchURL(term);
        clearSearch.hidden = search.value.length === 0;
        if (state !== 'ready') return;
        // Read the position before hiding cards can shorten the page and clamp scrollY.
        const pastFirstResult = resultArea.getBoundingClientRect().top < searchTools.getBoundingClientRect().bottom;
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = term ? new RegExp(escaped, 'gi') : null;
        let visible = 0;
        for (const item of cards) {
            const { domain, card } = item;
            const matchesFilter = filter === 'all' || (filter === 'available' && domain.available)
                || (filter === 'unavailable' && !domain.available) || (filter === 'github' && !!domain.repo)
                || (filter === 'saved' && bookmarks.has(domain.name));
            const matchesText = !term || domain.name.search(pattern) !== -1 || domain.description.search(pattern) !== -1;
            card.hidden = !(matchesFilter && matchesText);
            if (card.hidden) continue;
            visible++;
            if (item.highlighted !== term) {
                highlight(item.name, domain.name, pattern);
                highlight(item.description, domain.description, pattern);
                item.highlighted = term;
            }
        }
        grid.hidden = visible === 0;
        noResults.hidden = visible > 0;
        if (visible === 0) {
            const emptySaved = filter === 'saved' && !term;
            noResults.querySelector('h3').textContent = emptySaved ? 'No saved domains yet' : 'No domains found';
            noResults.querySelector('p').textContent = emptySaved
                ? 'Use the bookmark on a service to save it here.' : 'Try adjusting your search terms or filters';
            noResults.querySelector('p').hidden = !cards.length;
            byId('clearAllFilters').hidden = !cards.length && !term && filter === 'all';
        }
        results.textContent = resultMessage(visible, term);
        if (pastFirstResult) {
            resultArea.classList.add('keep-results-in-view');
            const offset = resultArea.getBoundingClientRect().top - searchTools.offsetHeight - 8;
            window.scrollBy({ top: offset, behavior: 'instant' });
        }
    }

    function setSelected(button, selected) {
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
    }

    function setFilter(value) {
        filter = value;
        for (const button of filters) setSelected(button, button.dataset.filter === filter);
        filterToggle.classList.toggle('active', filter !== 'all');
        filterToggle.setAttribute('aria-label', filter === 'all' ? 'Filters' : 'Filters, ' + filterLabels[filter] + ' selected');
        updateResults();
    }

    function closeFilters(returnFocus = false) {
        if (filterToggle.getAttribute('aria-expanded') !== 'true') return;
        filterToggle.setAttribute('aria-expanded', 'false');
        if (returnFocus) filterToggle.focus({ preventScroll: true });
    }

    function setView(view) {
        const list = view === 'list';
        grid.classList.toggle('list', list);
        grid.classList.toggle('gallery', !list);
        setSelected(listButton, list);
        setSelected(galleryButton, !list);
    }

    function chooseView(view) {
        setView(view);
        try {
            if (view) localStorage.setItem('domainView', view);
            else localStorage.removeItem('domainView');
        } catch {
            // Switching views still works if this browser blocks persistent storage.
        }
    }

    function isDomain(entry) {
        return entry && typeof entry.name === 'string' && typeof entry.description === 'string'
            && typeof entry.available === 'boolean' && typeof entry.url === 'string'
            && /^https?:\/\//i.test(entry.url) && (entry.repo == null || typeof entry.repo === 'string');
    }

    async function loadCatalogue() {
        if (state === 'loading') return;
        const retrying = state === 'error';
        state = 'loading';
        loader.hidden = false;
        loadError.hidden = true;
        noResults.hidden = true;
        grid.hidden = true;
        grid.setAttribute('aria-busy', 'true');
        results.textContent = '';
        try {
            const response = await fetch(catalogueURL);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            if (!Array.isArray(data) || !data.every(isDomain)) throw new Error('Invalid catalogue');
            data.sort((a, b) => Number(b.available) - Number(a.available));
            cards = data.map(createCard);
            grid.replaceChildren(...orderedCards().map(item => item.card));
            count.textContent = cards.length + '+ Free Domain Services';
            state = 'ready';
            updateResults();
        } catch (error) {
            state = 'error';
            loadError.hidden = false;
            console.error('Failed to load subdomains.json:', error);
        } finally {
            loader.hidden = true;
            grid.setAttribute('aria-busy', 'false');
            if (retrying && document.activeElement === document.body) {
                (state === 'ready' ? search : retry).focus({ preventScroll: true });
            }
        }
    }

    // Keep the repository link usable if its optional third-party badges fail.
    grid.addEventListener('error', event => {
        const image = event.target;
        if (!(image instanceof HTMLImageElement) || !image.matches('.github-stats img')) return;
        const stats = image.parentElement;
        image.remove();
        if (!stats.childElementCount) stats.remove();
    }, true);

    grid.addEventListener('click', event => {
        const button = event.target.closest('.bookmark-btn');
        if (!button) return;
        const name = button.dataset.domain;
        if (bookmarks.has(name)) bookmarks.delete(name);
        else bookmarks.add(name);
        try {
            localStorage.setItem(bookmarkKey, JSON.stringify([...bookmarks]));
        } catch {
            // Keep the shortlist usable for this visit when storage is unavailable.
        }
        renderBookmark(button);
        const order = orderedCards();
        const index = order.findIndex(item => item.bookmark === button);
        moveCard(order[index].card, order[index + 1]?.card || null);
        if (filter === 'saved') {
            updateResults();
            (grid.querySelector('.domain-card:not([hidden]) .bookmark-btn') || byId('clearAllFilters')).focus();
        }
    });
    window.addEventListener('storage', event => {
        if (event.key !== bookmarkKey && event.key !== null) return;
        bookmarks = readBookmarks();
        let before = null;
        for (const { card } of orderedCards().reverse()) {
            moveCard(card, before);
            before = card;
        }
        for (const item of cards) renderBookmark(item.bookmark);
        if (filter === 'saved') updateResults();
    });

    search.addEventListener('input', updateResults);
    clearSearch.addEventListener('click', () => {
        search.value = '';
        updateResults();
        search.focus();
    });
    byId('clearAllFilters').addEventListener('click', () => {
        search.value = '';
        setFilter('all');
        search.focus();
    });
    filterToggle.addEventListener('click', () => {
        const open = filterToggle.getAttribute('aria-expanded') === 'true';
        filterToggle.setAttribute('aria-expanded', String(!open));
    });
    for (const button of filters) button.addEventListener('click', () => {
        closeFilters(true);
        setFilter(button.dataset.filter);
    });
    searchFilters.addEventListener('focusout', event => {
        if (!searchFilters.contains(event.relatedTarget)) closeFilters();
    });
    window.matchMedia('(max-width: 58rem)').addEventListener('change', () => closeFilters());
    listButton.addEventListener('click', () => chooseView('list'));
    galleryButton.addEventListener('click', () => chooseView('gallery'));
    byId('resetViewBtn').addEventListener('click', () => chooseView(null));
    retry.addEventListener('click', loadCatalogue);

    document.addEventListener('keydown', event => {
        if (dialog.open || event.isComposing || event.defaultPrevented) return;
        if (event.key === 'Escape' && filterToggle.getAttribute('aria-expanded') === 'true') {
            event.preventDefault();
            closeFilters(true);
            return;
        }
        const editing = event.target instanceof Element
            && (event.target.isContentEditable || event.target.matches('input, textarea, select'));
        const searchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
        if (searchShortcut || (event.key === '/' && !editing && !event.altKey && !event.ctrlKey && !event.metaKey)) {
            event.preventDefault();
            search.focus();
            search.select();
        } else if (event.key === 'Escape' && event.target === search) {
            event.preventDefault();
            search.value = '';
            updateResults();
        }
    });

    document.addEventListener('click', event => {
        if (!searchFilters.contains(event.target)) closeFilters();
        const link = event.target.closest('a[target="_blank"]');
        if (!link || event.defaultPrevented || dialog.open) return;
        event.preventDefault();
        linkToOpen = link;
        byId('confirmLinkUrl').textContent = link.href;
        dialog.showModal();
        byId('cancelLink').focus();
    });
    byId('confirmLink').addEventListener('click', () => {
        if (linkToOpen) window.open(linkToOpen.href, '_blank', 'noopener,noreferrer');
        dialog.close();
    });
    byId('cancelLink').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
        linkToOpen?.focus({ preventScroll: true });
        linkToOpen = null;
    });

    const scrollTop = byId('scrollTop');
    function syncScrollButton() {
        scrollTop.hidden = window.scrollY <= 100;
    }
    scrollTop.addEventListener('click', () => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
    });
    window.addEventListener('scroll', syncScrollButton, { passive: true });
    syncScrollButton();

    let savedView;
    try {
        savedView = localStorage.getItem('domainView');
    } catch {
        // A private browsing session may block storage.
    }
    setView(savedView);
    window.addEventListener('popstate', restoreSearchFromURL);
    restoreSearchFromURL();
    loadCatalogue();
})();
