/**
 * ============================================================
 * WEBPOS - THEME MANAGER v3.0
 * Mengatur apply tema, dark mode, dan load settings dari Firebase
 * ============================================================
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'ocean';
    this.darkMode = false;
    this.settings = null;
    this.uid = null;
    this.listeners = [];
    this.init();
  }

  init() {
    // Cek localStorage dulu (untuk load cepat sebelum Firebase ready)
    const cached = localStorage.getItem('webpos_theme_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        this.applyTheme(parsed.theme, parsed.darkMode);
        this.applyFontScale(parsed.fontScale || 1);
        this.applyBorderRadius(parsed.borderRadius || '12px');
      } catch(e) { console.warn('Cache tema rusak', e); }
    }

    // Listen auth state
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.uid = user.uid;
          this.loadFromFirebase();
        }
      });
    }
  }

  // ─── LOAD SETTINGS DARI FIREBASE ───
  async loadFromFirebase() {
    if (!this.uid) return;
    try {
      const snapshot = await firebase.database().ref(`settings/${this.uid}`).once('value');
      const data = snapshot.val() || {};
      this.settings = this.mergeWithDefaults(data);

      // Apply semua
      this.applyTheme(this.settings.theme.activeTheme, this.settings.theme.darkMode);
      this.applyFontScale(this.settings.theme.fontScale);
      this.applyBorderRadius(this.settings.theme.borderRadius);

      // Save ke localStorage untuk load cepat berikutnya
      localStorage.setItem('webpos_theme_cache', JSON.stringify({
        theme: this.settings.theme.activeTheme,
        darkMode: this.settings.theme.darkMode,
        fontScale: this.settings.theme.fontScale,
        borderRadius: this.settings.theme.borderRadius,
        timestamp: Date.now()
      }));

      // Notify listeners
      this.notifyListeners();

      console.log('✅ Theme loaded from Firebase:', this.settings.theme.activeTheme);
    } catch (err) {
      console.error('❌ Gagal load theme:', err);
    }
  }

  // ─── SAVE SETTINGS KE FIREBASE ───
  async saveToFirebase(path, value) {
    if (!this.uid) {
      console.warn('User belum login, simpan ke localStorage saja');
      return;
    }
    try {
      await firebase.database().ref(`settings/${this.uid}/${path}`).set(value);
      // Update local cache
      if (this.settings) {
        this.setNestedValue(this.settings, path, value);
        localStorage.setItem('webpos_theme_cache', JSON.stringify({
          theme: this.settings.theme.activeTheme,
          darkMode: this.settings.theme.darkMode,
          fontScale: this.settings.theme.fontScale,
          borderRadius: this.settings.theme.borderRadius,
          timestamp: Date.now()
        }));
      }
      this.notifyListeners();
    } catch (err) {
      console.error('❌ Gagal save setting:', err);
      alert('Gagal menyimpan pengaturan. Cek koneksi internet.');
    }
  }

  // ─── APPLY THEME ───
  applyTheme(themeName, isDark = false) {
    const html = document.documentElement;
    html.setAttribute('data-theme', themeName);
    html.setAttribute('data-dark', isDark ? 'true' : 'false');
    this.currentTheme = themeName;
    this.darkMode = isDark;

    // Update meta theme-color untuk mobile
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const colors = {
        ocean: isDark ? '#0c4a6e' : '#0ea5e9',
        forest: isDark ? '#064e3b' : '#10b981',
        sunset: isDark ? '#7c2d12' : '#f97316',
        royal: isDark ? '#4c1d95' : '#8b5cf6',
        rose: isDark ? '#881337' : '#e11d48',
        cyber: '#06b6d4',
        slate: isDark ? '#1e293b' : '#475569'
      };
      metaTheme.setAttribute('content', colors[themeName] || colors.ocean);
    }
  }

  // ─── TOGGLE DARK MODE ───
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.applyTheme(this.currentTheme, this.darkMode);
    if (this.settings) {
      this.settings.theme.darkMode = this.darkMode;
    }
    this.saveToFirebase('theme/darkMode', this.darkMode);
  }

  // ─── SET THEME ───
  setTheme(themeName) {
    this.applyTheme(themeName, this.darkMode);
    if (this.settings) {
      this.settings.theme.activeTheme = themeName;
    }
    this.saveToFirebase('theme/activeTheme', themeName);
  }

  // ─── FONT SCALE ───
  applyFontScale(scale) {
    document.documentElement.style.setProperty('--font-scale', scale);
  }

  setFontScale(scale) {
    this.applyFontScale(scale);
    if (this.settings) this.settings.theme.fontScale = scale;
    this.saveToFirebase('theme/fontScale', scale);
  }

  // ─── BORDER RADIUS ───
  applyBorderRadius(radius) {
    document.documentElement.style.setProperty('--radius', radius);
  }

  setBorderRadius(radius) {
    this.applyBorderRadius(radius);
    if (this.settings) this.settings.theme.borderRadius = radius;
    this.saveToFirebase('theme/borderRadius', radius);
  }

  // ─── RECEIPT SETTINGS ───
  getReceiptSettings() {
    return this.settings?.receipt || DEFAULT_SETTINGS.receipt;
  }

  async updateReceiptSettings(path, value) {
    await this.saveToFirebase(`receipt/${path}`, value);
  }

  // ─── BLUETOOTH SETTINGS ───
  getBluetoothSettings() {
    return this.settings?.bluetooth || DEFAULT_SETTINGS.bluetooth;
  }

  async updateBluetoothSettings(path, value) {
    await this.saveToFirebase(`bluetooth/${path}`, value);
  }

  // ─── HELPERS ───
  mergeWithDefaults(data) {
    // Simple merge (asumsi DEFAULT_SETTINGS sudah di-load)
    return { ...DEFAULT_SETTINGS, ...data };
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('/');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  // ─── EVENT LISTENERS ───
  onSettingsChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this.settings); } catch(e) { console.error(e); }
    });
  }

  // ─── GET CURRENT THEME INFO ───
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      darkMode: this.darkMode,
      displayName: this.getThemeDisplayName(this.currentTheme)
    };
  }

  getThemeDisplayName(theme) {
    const names = {
      ocean: '🌊 Ocean Breeze',
      forest: '🌲 Forest Mint',
      sunset: '🌅 Sunset Glow',
      royal: '👑 Royal Purple',
      rose: '🌹 Rose Gold',
      cyber: '⚡ Midnight Cyber',
      slate: '🪨 Clean Slate'
    };
    return names[theme] || theme;
  }

  // ─── LIST ALL THEMES ───
  getAllThemes() {
    return [
      { id: 'ocean', name: '🌊 Ocean Breeze', desc: 'Biru laut segar & profesional' },
      { id: 'forest', name: '🌲 Forest Mint', desc: 'Hijau natural & menyegarkan' },
      { id: 'sunset', name: '🌅 Sunset Glow', desc: 'Oranye magenta warm' },
      { id: 'royal', name: '👑 Royal Purple', desc: 'Ungu elegan & mewah' },
      { id: 'rose', name: '🌹 Rose Gold', desc: 'Pink modern & stylish' },
      { id: 'cyber', name: '⚡ Midnight Cyber', desc: 'Hitam biru neon (dark default)' },
      { id: 'slate', name: '🪨 Clean Slate', desc: 'Abu minimalis bersih' }
    ];
  }
}

// Singleton instance
const themeManager = new ThemeManager();

// Export
if (typeof module !== 'undefined') module.exports = { ThemeManager, themeManager };
