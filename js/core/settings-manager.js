/**
 * SETTINGS MANAGER — WebPOS V2
 * Load & apply semua setting dari Firebase /settings
 */

const SettingsManager = {
    _settings: null,

    async load() {
        try {
            const snap = await db.ref('settings').once('value');
            this._settings = snap.val() || {};
            window._appSettings = this._settings;

            // Apply dark mode
            const isDark = this._settings.app?.darkMode || false;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

            // Apply theme color
            const themeName = this._settings.app?.theme || 'ocean';
            ThemeEngine.apply(themeName);

            return this._settings;
        } catch (e) {
            console.warn('Settings load failed:', e);
            window._appSettings = {};
            return {};
        }
    },

    get(keyPath) {
        return keyPath.split('.').reduce((o,k)=> (o||{})[k], this._settings);
    },

    async save(path, value) {
        await db.ref('settings/' + path).set(value);
        // Refresh local
        if (!this._settings) this._settings = {};
        const keys = path.split('/');
        let cur = this._settings;
        for (let i=0; i<keys.length-1; i++) {
            cur[keys[i]] = cur[keys[i]] || {};
            cur = cur[keys[i]];
        }
        cur[keys[keys.length-1]] = value;
        window._appSettings = this._settings;
    },

    toggleDarkMode() {
        const current = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = !current;
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
        this.save('app/darkMode', next);
    }
};

window.SettingsManager = SettingsManager;
