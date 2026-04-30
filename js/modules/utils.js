/**
 * ===================================================================
 * FILE    : js/modules/utils.js
 * FUNGSI  : Utility global untuk tema, dark mode, format, dan UI helper
 * ISI     :
 *   1. TEMA SYSTEM (10 tema + dark mode)
 *   2. Apply tema ke CSS variables
 *   3. Dark mode toggle
 *   4. Format tanggal, rupiah (backup kalau firebase-config belum load)
 *   5. Mobile detection
 *   6. Sidebar / Navigation helper
 * DEPENDENSI: firebase-config.js (untuk DB_PENGATURAN)
 * CATATAN: Semua page WAJIB load file ini setelah firebase-config.js
 * ===================================================================
 */

// ===================== 10 TEMA PALET =====================
const THEME_PALETTES = {
  mint: {
    name: "Mint Fresh",
    colors: { primary:"#10b981", primaryLight:"#34d399", primaryDark:"#059669",
              bg:"#f0fdf4", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#d1fae5", shadow:"rgba(16,185,129,0.12)" }
  },
  ocean: {
    name: "Ocean Blue",
    colors: { primary:"#0ea5e9", primaryLight:"#38bdf8", primaryDark:"#0284c7",
              bg:"#f0f9ff", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#bae6fd", shadow:"rgba(14,165,233,0.12)" }
  },
  sunset: {
    name: "Sunset Glow",
    colors: { primary:"#f97316", primaryLight:"#fb923c", primaryDark:"#ea580c",
              bg:"#fff7ed", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#fed7aa", shadow:"rgba(249,115,22,0.12)" }
  },
  darkpro: {
    name: "Dark Pro",
    colors: { primary:"#64748b", primaryLight:"#94a3b8", primaryDark:"#475569",
              bg:"#0f172a", surface:"#1e293b", text:"#f1f5f9", textSec:"#94a3b8",
              border:"#334155", shadow:"rgba(0,0,0,0.3)" }
  },
  berry: {
    name: "Berry Purple",
    colors: { primary:"#8b5cf6", primaryLight:"#a78bfa", primaryDark:"#7c3aed",
              bg:"#faf5ff", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#e9d5ff", shadow:"rgba(139,92,246,0.12)" }
  },
  coral: {
    name: "Coral Peach",
    colors: { primary:"#f43f5e", primaryLight:"#fb7185", primaryDark:"#e11d48",
              bg:"#fff1f2", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#fecdd3", shadow:"rgba(244,63,94,0.12)" }
  },
  forest: {
    name: "Forest Green",
    colors: { primary:"#059669", primaryLight:"#10b981", primaryDark:"#047857",
              bg:"#ecfdf5", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#a7f3d0", shadow:"rgba(5,150,105,0.12)" }
  },
  midnight: {
    name: "Midnight Navy",
    colors: { primary:"#1e3a8a", primaryLight:"#3b82f6", primaryDark:"#1e40af",
              bg:"#eff6ff", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#bfdbfe", shadow:"rgba(30,58,138,0.12)" }
  },
  golden: {
    name: "Golden Sand",
    colors: { primary:"#d97706", primaryLight:"#fbbf24", primaryDark:"#b45309",
              bg:"#fffbeb", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#fde68a", shadow:"rgba(217,119,6,0.12)" }
  },
  slate: {
    name: "Slate Minimal",
    colors: { primary:"#475569", primaryLight:"#94a3b8", primaryDark:"#334155",
              bg:"#f8fafc", surface:"#ffffff", text:"#1f2937", textSec:"#6b7280",
              border:"#e2e8f0", shadow:"rgba(71,85,105,0.12)" }
  }
};

// ===================== TEMA MANAGER =====================
const THEME = {

  /**
   * apply(temaKey, isDark=false)
   * Fungsi : Ganti CSS variables di <html> berdasarkan tema
   * Pakai  : Di setiap page saat load, atau saat ganti tema di setting
   */
  apply: function(temaKey, isDark=false) {
    const tema = THEME_PALETTES[temaKey] || THEME_PALETTES.mint;
    const root = document.documentElement;
    const c = tema.colors;

    root.style.setProperty('--primary',       c.primary);
    root.style.setProperty('--primary-light', c.primaryLight);
    root.style.setProperty('--primary-dark',  c.primaryDark);
    root.style.setProperty('--text',          c.text);
    root.style.setProperty('--text-secondary',c.textSec);
    root.style.setProperty('--border',        c.border);

    if (isDark) {
      root.style.setProperty('--bg',     '#0f172a');
      root.style.setProperty('--surface','#1e293b');
      root.style.setProperty('--shadow', 'rgba(0,0,0,0.4)');
      root.style.setProperty('--text',   '#f1f5f9');
    } else {
      root.style.setProperty('--bg',      c.bg);
      root.style.setProperty('--surface', c.surface);
      root.style.setProperty('--shadow',  c.shadow);
    }

    // Simpan preferensi
    localStorage.setItem('webpos_tema_v3', temaKey);
    localStorage.setItem('webpos_dark_v3', isDark ? '1' : '0');
  },

  /**
   * init()
   * Fungsi : Load tema tersimpan saat page dibuka
   */
  init: function() {
    const savedTema = localStorage.getItem('webpos_tema_v3') || 'mint';
    const savedDark = localStorage.getItem('webpos_dark_v3') === '1';
    THEME.apply(savedTema, savedDark);
    return { tema: savedTema, dark: savedDark };
  },

  /**
   * toggleDark()
   * Fungsi : Switch dark/light mode
   */
  toggleDark: function() {
    const current = localStorage.getItem('webpos_dark_v3') === '1';
    const tema = localStorage.getItem('webpos_tema_v3') || 'mint';
    THEME.apply(tema, !current);
    return !current;
  },

  /**
   * getList()
   * Fungsi : Ambil daftar semua tema (untuk dropdown di setting)
   */
  getList: function() {
    return Object.keys(THEME_PALETTES).map(key => ({
      key: key,
      name: THEME_PALETTES[key].name,
      colors: THEME_PALETTES[key].colors
    }));
  }
};

// ===================== FORMAT UTILS =====================
const UTILS = {

  formatRupiah: (angka) => {
    if (angka === undefined || angka === null) return 'Rp 0';
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },

  formatTanggal: (timestamp) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
  },

  formatWaktu: (timestamp) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    return d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
  },

  formatDateTime: (timestamp) => {
    return UTILS.formatTanggal(timestamp) + ' ' + UTILS.formatWaktu(timestamp);
  },

  isMobile: () => {
    return window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
  },

  // Debounce untuk search
  debounce: (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
};

// ===================== SIDEBAR / NAV HELPER =====================
const NAV = {

  /**
   * renderSidebar(activeMenu)
   * Fungsi : Render sidebar HTML ke element #sidebar
   *          Sesuaikan menu berdasarkan role user
   * Pakai  : Di setiap page (index, kasir, produk, dll)
   */
  renderSidebar: function(activeMenu) {
    const session = window.AUTH ? AUTH.getSession() : null;
    const role = session ? session.role : 'kasir';

    // Semua menu (nanti bisa difilter berdasarkan menu_access)
    const menus = [
      { id:'index',       label:'Dashboard',      icon:'📊', file:'index.html',       roles:['developer','owner','admin','kasir'] },
      { id:'kasir',       label:'Kasir',          icon:'🛒', file:'page-kasir.html',  roles:['developer','owner','admin','kasir'] },
      { id:'produk',      label:'Produk',         icon:'📦', file:'page-produk.html', roles:['developer','owner','admin'] },
      { id:'pembelian',   label:'Pembelian',      icon:'🚚', file:'page-pembelian.html',roles:['developer','owner','admin'] },
      { id:'riwayat',     label:'Riwayat',        icon:'📋', file:'page-riwayat.html',roles:['developer','owner','admin','kasir'] },
      { id:'hutang',      label:'Hutang',         icon:'🤝', file:'page-hutang.html', roles:['developer','owner','admin','kasir'] },
      { id:'pelanggan',   label:'Pelanggan',      icon:'👥', file:'page-data-pelanggan.html', roles:['developer','owner','admin','kasir'] },
      { id:'kas',         label:'Kas',            icon:'💰', file:'page-kas.html',    roles:['developer','owner','admin'] },
      { id:'laporan',     label:'Laporan',        icon:'📈', file:'page-laporan.html',roles:['developer','owner','admin'] },
      { id:'pengguna',    label:'Pengguna',       icon:'🔐', file:'page-pengguna.html',roles:['developer','owner'] },
      { id:'setting',     label:'Pengaturan',     icon:'⚙️', file:'page-setting.html',roles:['developer','owner','admin'] },
      { id:'backup',      label:'Backup',         icon:'💾', file:'page-backup.html', roles:['developer','owner'] },
    ];

    // Filter menu berdasarkan role
    const visible = menus.filter(m => m.roles.includes(role));

    let html = '<div class="sidebar-header"><div class="sidebar-logo">🛒 WebPOS</div></div>';
    html += '<ul class="sidebar-menu">';
    visible.forEach(m => {
      const active = m.id === activeMenu ? 'active' : '';
      html += `<li><a href="${m.file}" class="${active}"><span class="icon">${m.icon}</span><span class="label">${m.label}</span></a></li>`;
    });
    html += '</ul>';
    html += '<div class="sidebar-footer"><button onclick="AUTH.logout().then(()=>location.href=\'login.html\')">🚪 Keluar</button></div>';

    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) sidebarEl.innerHTML = html;
  },

  /**
   * initMobileMenu()
   * Fungsi : Toggle sidebar di mobile (burger menu)
   */
  initMobileMenu: function() {
    const burger = document.getElementById('burgerMenu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!burger || !sidebar) return;

    burger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
  }
};

// ===================== EXPORT =====================
window.THEME = THEME;
window.THEME_PALETTES = THEME_PALETTES;
window.UTILS = UTILS;
window.NAV = NAV;
