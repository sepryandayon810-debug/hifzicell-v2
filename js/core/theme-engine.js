/**
 * THEME ENGINE — WebPOS V2
 * Mengatur CSS variables dan dark mode.
 * Dipanggil otomatis oleh settings-manager.js
 */

const ThemeEngine = {
    init() {
        // Cek localStorage untuk FOUC prevention (sebelum Firebase load)
        const savedTheme = localStorage.getItem('wp_theme') || 'ocean';
        const savedDark = JSON.parse(localStorage.getItem('wp_dark') || 'false');

        // Preload tema dari localStorage (akan di-override oleh settings-manager nanti)
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/themes/${savedTheme}.css?v=2`;
        link.setAttribute('data-theme', savedTheme);
        document.head.appendChild(link);

        if (savedDark) document.documentElement.classList.add('dark');
    },

    // Fungsi tambahan untuk toggle dark mode tanpa reload
    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        SettingsManager.set('app/darkMode', isDark);
        localStorage.setItem('wp_dark', JSON.stringify(isDark));
        return isDark;
    },

    // Preview tema tanpa simpan
    previewTheme(themeName) {
        document.querySelectorAll('link[data-theme]').forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/themes/${themeName}.css?v=2`;
        link.setAttribute('data-theme', themeName);
        document.head.appendChild(link);
    }
};

// Auto-init FOUC prevention
ThemeEngine.init();
window.ThemeEngine = ThemeEngine;
