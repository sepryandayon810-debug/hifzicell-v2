/**
 * THEME ENGINE — WebPOS V2
 * Apply CSS variables dari tema yang dipilih
 */

const ThemeEngine = {
    themes: {
        ocean:    { primary:'#0ea5e9', primaryDark:'#0284c7', secondary:'#06b6d4', accent:'#38bdf8' },
        forest:   { primary:'#10b981', primaryDark:'#047857', secondary:'#84cc16', accent:'#34d399' },
        sunset:   { primary:'#f97316', primaryDark:'#c2410c', secondary:'#f59e0b', accent:'#fb923c' },
        midnight: { primary:'#6366f1', primaryDark:'#4338ca', secondary:'#a78bfa', accent:'#818cf8' },
        cherry:   { primary:'#e11d48', primaryDark:'#be123c', secondary:'#fb7185', accent:'#f43f5e' },
        lavender: { primary:'#8b5cf6', primaryDark:'#6d28d9', secondary:'#c4b5fd', accent:'#a78bfa' },
        coffee:   { primary:'#92400e', primaryDark:'#78350f', secondary:'#b45309', accent:'#a16207' },
        mint:     { primary:'#14b8a6', primaryDark:'#0f766e', secondary:'#2dd4bf', accent:'#5eead4' },
        coral:    { primary:'#f43f5e', primaryDark:'#be123c', secondary:'#fb7185', accent:'#fda4af' },
        slate:    { primary:'#475569', primaryDark:'#1e293b', secondary:'#94a3b8', accent:'#64748b' }
    },

    init() {
        const saved = window._appSettings?.app?.theme || 'ocean';
        this.apply(saved);
    },

    apply(themeName) {
        const t = this.themes[themeName] || this.themes.ocean;
        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--primary-dark', t.primaryDark);
        root.style.setProperty('--secondary', t.secondary);
        root.style.setProperty('--accent', t.accent);
        root.setAttribute('data-theme-color', themeName);
    },

    preview(themeName) {
        this.apply(themeName);
    }
};

window.ThemeEngine = ThemeEngine;
