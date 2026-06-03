const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Free Domains | You're Offline</title>
    <meta name="description" content="Looks like you've lost your internet connection. The page you're trying to reach isn't available right now.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    <style>
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --bg-tertiary: #f1f5f9;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --text-tertiary: #94a3b8;
            --border-color: #e2e8f0;
            --accent-color: #3b82f6;
            --accent-hover: #2563eb;
            --success-color: #10b981;
            --danger-color: #ef4444;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        [data-theme="dark"] {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --text-primary: #f1f5f9;
            --text-secondary: #cbd5e1;
            --text-tertiary: #94a3b8;
            --border-color: #334155;
            --accent-color: #60a5fa;
            --accent-hover: #3b82f6;
            --success-color: #34d399;
            --danger-color: #f87171;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            transition: background-color 0.3s ease, color 0.3s ease;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

        /* Header */
        .header {
            background-color: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            padding: 1rem 0;
            backdrop-filter: blur(10px);
        }

        .header-content { display: flex; justify-content: space-between; align-items: center; }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            text-decoration: none;
            transition: all 0.3s ease;
            pointer-events: none; /* Disabled while offline */
            opacity: 0.5;
        }

        .theme-toggle {
            background: none;
            border: 2px solid var(--border-color);
            border-radius: 50px;
            padding: 0.5rem;
            cursor: pointer;
            color: var(--text-primary);
            font-size: 1.2rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
        }

        .theme-toggle:hover {
            border-color: var(--accent-color);
            background-color: var(--bg-tertiary);
            transform: scale(1.05);
        }

        /* Main */
        .main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem 0;
            position: relative;
            overflow: hidden;
        }

        .error-container {
            text-align: center;
            max-width: 600px;
            position: relative;
            z-index: 2;
        }

        .error-number {
            font-size: 5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--accent-color), #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1;
            margin-bottom: 1rem;
            animation: float 3s ease-in-out infinite;
        }

        .error-title {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .error-subtitle {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.5;
        }

        .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 3rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
        }

        .btn-primary {
            background-color: var(--accent-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background-color: var(--bg-secondary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        /* Disabled button style */
        .btn-disabled {
            background-color: var(--bg-tertiary);
            color: var(--text-tertiary);
            border: 1px solid var(--border-color);
            cursor: not-allowed;
            opacity: 0.5;
            pointer-events: none;
        }

        /* Tips card — replaces Popular Destinations */
        .tips-card {
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 1rem;
            padding: 2rem;
            margin-top: 2rem;
            text-align: left;
        }

        .tips-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.25rem;
            color: var(--text-primary);
        }

        .tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
        }

        .tip-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.875rem;
            background-color: var(--bg-tertiary);
            border-radius: 0.5rem;
            border: 1px solid transparent;
            transition: border-color 0.2s ease;
        }

        .tip-item:hover {
            border-color: var(--accent-color);
        }

        .tip-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }

        .tip-text {
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        .tip-text strong {
            display: block;
            color: var(--text-primary);
            font-weight: 600;
            margin-bottom: 2px;
            font-size: 0.875rem;
        }

        /* Connection restored toast */
        .toast {
            display: none;
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--bg-secondary);
            border: 1px solid var(--success-color);
            color: var(--text-primary);
            padding: 12px 22px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            align-items: center;
            gap: 10px;
            white-space: nowrap;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
            z-index: 9999;
            animation: toastIn 0.4s ease forwards;
            font-family: 'Inter', sans-serif;
        }

        .toast-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: var(--success-color);
            flex-shrink: 0;
        }

        .toast-btn {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 5px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            margin-left: 6px;
            transition: background-color 0.2s, transform 0.2s;
        }

        .toast-btn:hover {
            background-color: var(--accent-hover);
            transform: scale(1.05);
        }

        /* Floating background elements */
        .floating-elements {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .floating-element {
            position: absolute;
            opacity: 0.1;
            animation: floatRandom 6s ease-in-out infinite;
        }

        .floating-element:nth-child(1) { top: 20%;  left: 10%;  animation-delay: 0s; font-size: 2rem; }
        .floating-element:nth-child(2) { top: 60%;  right: 15%; animation-delay: 1s; font-size: 1.5rem; }
        .floating-element:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 2s; font-size: 1.8rem; }
        .floating-element:nth-child(4) { top: 40%;  right: 30%; animation-delay: 3s; font-size: 1.2rem; }
        .floating-element:nth-child(5) { bottom: 20%; right: 10%; animation-delay: 4s; font-size: 2.2rem; }

        /* Animations */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-20px); }
        }

        @keyframes floatRandom {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33%       { transform: translateY(-15px) rotate(5deg); }
            66%       { transform: translateY(10px) rotate(-3deg); }
        }

        @keyframes toastIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .fade-in {
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* Footer */
        .footer {
            background-color: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            padding: 2rem 0;
            margin-top: 4rem;
            text-align: center;
        }

        .footer-content { color: var(--text-secondary); }

        /* Responsive */
        @media (max-width: 768px) {
            .error-number  { font-size: 3.5rem; }
            .error-title   { font-size: 2rem; }
            .error-subtitle { font-size: 1rem; }
            .error-actions { flex-direction: column; align-items: center; }
            .tips-grid     { grid-template-columns: 1fr; }
            .tips-card     { padding: 1.5rem; }
        }

        @media (max-width: 480px) {
            .error-number { font-size: 2.5rem; }
            .error-title  { font-size: 1.5rem; }
        }
    </style>
</head>
<body>

    <!-- Connection restored toast -->
    <div class="toast" id="toast">
        <div class="toast-dot"></div>
        <span>Connection restored!</span>
        <button class="toast-btn" onclick="location.reload()">Reload</button>
    </div>

    <header class="header">
        <div class="container">
            <div class="header-content">
                <!-- Logo disabled while offline -->
                <span class="logo">🌐 Free Domains</span>
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                    <span id="themeIcon">🌙</span>
                </button>
            </div>
        </div>
    </header>

    <main class="main">
        <div class="floating-elements">
            <div class="floating-element">📡</div>
            <div class="floating-element">🔌</div>
            <div class="floating-element">💻</div>
            <div class="floating-element">⚡</div>
            <div class="floating-element">🌐</div>
        </div>

        <div class="container">
            <div class="error-container fade-in">

                <div class="error-number">You're Offline!</div>
                <h1 class="error-title">No Internet Connection</h1>
                <p class="error-subtitle">
                    Looks like you've lost your internet connection.
                    The page you're trying to reach isn't available right now.
                </p>

                <div class="error-actions">
                    <button onclick="location.reload()" class="btn btn-secondary">
                        🔄 Try Again
                    </button>
                    <!-- Home button disabled while offline — can't navigate without connection -->
                    <span class="btn btn-disabled">
                        🏠 Home
                    </span>
                </div>

                <!-- Tips card — helpful while offline instead of links that won't work -->
                <div class="tips-card">
                    <h3>🛠️ While you're waiting...</h3>
                    <div class="tips-grid">
                        <div class="tip-item">
                            <span class="tip-icon">📶</span>
                            <div class="tip-text">
                                <strong>Check your WiFi</strong>
                                Make sure you're connected to a network
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">✈️</span>
                            <div class="tip-text">
                                <strong>Airplane mode?</strong>
                                Disable it if it's switched on
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">🔄</span>
                            <div class="tip-text">
                                <strong>Restart your router</strong>
                                Unplug it, wait 10 seconds, plug it back in
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">📱</span>
                            <div class="tip-text">
                                <strong>Try mobile data</strong>
                                Switch to your phone's hotspot as a backup
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <p>© 2025 Project by <a href="https://harys.is-a.dev/" target="_blank" style="color: var(--accent-color);">harys722</a>. | All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        /* Theme toggle — works offline, saves to localStorage */
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon   = document.getElementById('themeIcon');

        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const t = document.body.getAttribute('data-theme');
            const newTheme = t === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
            localStorage.setItem('theme', newTheme);
        });

        function updateThemeIcon(theme) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        /* Parallax floating elements */
        document.addEventListener('mousemove', e => {
            const els = document.querySelectorAll('.floating-element');
            const mx = e.clientX / window.innerWidth;
            const my = e.clientY / window.innerHeight;
            els.forEach((el, i) => {
                const speed = (i + 1) * 0.5;
                el.style.transform = 'translate(' + (mx - 0.5) * speed + 'px, ' + (my - 0.5) * speed + 'px)';
            });
        });

        /* Connection restored toast — user decides when to reload */
        window.addEventListener('online', () => {
            const toast = document.getElementById('toast');
            toast.style.display = 'flex';
        });

        /* Konami code easter egg — preserved from original */
        let konamiCode = [];
        const konamiSequence = [
            'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
            'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
            'KeyB','KeyA'
        ];

        document.addEventListener('keydown', e => {
            konamiCode.push(e.code);
            if (konamiCode.length > konamiSequence.length) konamiCode.shift();
            if (konamiCode.join('') === konamiSequence.join('')) {
                const els = document.querySelectorAll('.floating-element');
                els.forEach(el => { el.textContent = '🎉'; el.style.opacity = '0.3'; });
                const title = document.querySelector('.error-title');
                const orig  = title.textContent;
                title.textContent = '🎉 You found the secret! 🎉';
                title.style.background = 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)';
                title.style.webkitBackgroundClip = 'text';
                title.style.webkitTextFillColor  = 'transparent';
                setTimeout(() => {
                    title.textContent = orig;
                    title.style.background = '';
                    title.style.webkitBackgroundClip = '';
                    title.style.webkitTextFillColor  = '';
                    const icons = ['📡','🔌','💻','⚡','🌐'];
                    els.forEach((el, i) => { el.textContent = icons[i]; el.style.opacity = '0.1'; });
                }, 3000);
                konamiCode = [];
            }
        });
    </script>
</body>
</html>`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(OFFLINE_HTML, {
        headers: { 'Content-Type': 'text/html' }
      });
    })
  );
});
