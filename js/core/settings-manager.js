/**
 * SETTINGS MANAGER — WebPOS V2
 * SATU-SATUNYA sumber truth untuk semua konfigurasi.
 * Semua page WAJIB panggil initApp() di awal.
 * Tidak ada hardcode setting di page lain!
 */

const SettingsManager = {
    _cache: null,
    _listeners: [],

    getDefaults() {
        return {
            app: {
                theme: 'ocean',
                darkMode: false,
                storeName: 'TOKO SAYA',
                storeAddress: '',
                storePhone: '',
                currency: 'IDR',
                language: 'id'
            },
            receipt: {
                headerText: 'TOKO SAYA',
                footerText: 'Terima Kasih Atas Kunjungan Anda',
                showLogo: false,
                logoUrl: '',
                printerType: 'share',   // bluetooth | pdf | share
                paperWidth: 58          // 58 | 80
            },
            bluetooth: {
                deviceName: '',
                deviceId: '',
                autoConnect: false,
                lastConnected: null
            },
            access: {
                developer: this._allAccess(),
                owner: this._allAccess(),
                admin: this._allAccess(),
                kasir: this._allAccess()
            }
        };
    },

    _allAccess() {
        return {
            kasir: true, produk: true, pembelian: true, riwayat: true,
            hutang: true, laporan: true, kas: true, pelanggan: true,
            pengaturan: true, backup: true
        };
    },

    async load() {
        try {
            const snap = await db.ref('settings').once('value');
            const val = snap.val();
            if (!val) {
                // First time: seed defaults
                const defs = this.getDefaults();
                await db.ref('settings').set(defs);
                this._cache = defs;
            } else {
                // Merge dengan defaults (untuk field baru)
                this._cache = this._deepMerge(this.getDefaults(), val);
            }
            return this._cache;
        } catch (err) {
            console.error('[SettingsManager] Load error:', err);
            this._cache = this.getDefaults();
            return this._cache;
        }
    },

    get(path) {
        if (!this._cache) return null;
        const keys = path.split('/').filter(Boolean);
        let val = this._cache;
        for (const k of keys) {
            if (val && typeof val === 'object' && k in val) val = val[k];
            else return null;
        }
        return val;
    },

    async set(path, value) {
        await db.ref(`settings/${path}`).set(value);
        // Update cache
        if (!this._cache) this._cache = {};
        const keys = path.split('/').filter(Boolean);
        let ref = this._cache;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!ref[keys[i]]) ref[keys[i]] = {};
            ref = ref[keys[i]];
        }
        ref[keys[keys.length - 1]] = value;
        this._notify(path, value);
    },

    async update(updates) {
        // updates = { 'app/theme': 'forest', 'app/darkMode': true }
        const fbUpdates = {};
        for (const [path, val] of Object.entries(updates)) {
            fbUpdates[`settings/${path}`] = val;
            // Update cache
            const keys = path.split('/').filter(Boolean);
            let ref = this._cache;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!ref[keys[i]]) ref[keys[i]] = {};
                ref = ref[keys[i]];
            }
            ref[keys[keys.length - 1]] = val;
        }
        await db.ref().update(fbUpdates);
        this._notify('batch', updates);
    },

    applyTheme() {
        const theme = this.get('app/theme') || 'ocean';
        const isDark = this.get('app/darkMode') || false;

        // Hapus link tema lama
        document.querySelectorAll('link[data-theme]').forEach(el => el.remove());

        // Inject tema baru
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/themes/${theme}.css?v=2`;
        link.setAttribute('data-theme', theme);
        document.head.appendChild(link);

        // Dark mode class
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

        // FOUC prevention (localStorage hanya untuk initial load)
        localStorage.setItem('wp_theme', theme);
        localStorage.setItem('wp_dark', JSON.stringify(isDark));
    },

    applyStoreName() {
        const name = this.get('app/storeName') || 'TOKO SAYA';
        document.querySelectorAll('[data-store-name]').forEach(el => {
            el.textContent = name;
        });
        document.title = document.title.replace(/^.*?\|/, name + ' |');
    },

    getStoreName() { return this.get('app/storeName') || 'TOKO SAYA'; },
    getStoreAddress() { return this.get('app/storeAddress') || ''; },
    getStorePhone() { return this.get('app/storePhone') || ''; },
    getReceiptConfig() { return this.get('receipt') || this.getDefaults().receipt; },
    getBluetoothConfig() { return this.get('bluetooth') || this.getDefaults().bluetooth; },
    getAccess(role) { return this.get(`access/${role}`) || this._allAccess(); },

    onChange(callback) {
        this._listeners.push(callback);
    },

    _notify(path, value) {
        this._listeners.forEach(cb => cb(path, value));
    },

    _deepMerge(target, source) {
        const out = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                out[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                out[key] = source[key];
            }
        }
        return out;
    }
};

window.SettingsManager = SettingsManager;

// ============================================================
// GLOBAL INIT — Panggil ini di setiap page!
// ============================================================
async function initApp() {
    // 1. Auth state
    await Auth.init();
    if (!Auth.getCurrentUser() && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html?mode=login';
        return;
    }

    // 2. Load settings
    await SettingsManager.load();

    // 3. Apply theme & store name
    SettingsManager.applyTheme();
    SettingsManager.applyStoreName();

    // 4. Render sidebar (jika ada container #sidebar)
    if (window.Sidebar && document.getElementById('sidebar')) {
        Sidebar.render();
    }

    // 5. Tampilkan user info di header
    const user = Auth.getUserProfile();
    if (user) {
        document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name || user.email);
        document.querySelectorAll('[data-user-role]').forEach(el => {
            el.textContent = (user.role || 'kasir').toUpperCase();
            el.className = `role-badge role-${user.role || 'kasir'}`;
        });
    }

    console.log('[initApp] Ready. Theme:', SettingsManager.get('app/theme'), 'Dark:', SettingsManager.get('app/darkMode'));
}

window.initApp = initApp;
