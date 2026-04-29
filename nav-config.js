/**
 * ============================================================
 * WEBPOS - NAV CONFIG / SIDEBAR RENDERER v1.0
 * Render sidebar otomatis berdasarkan permissions
 * Phase 1: Foundation Layer
 * ============================================================
 */

class SidebarRenderer {
  constructor() {
    this.sidebar = null;
    this.mobileToggle = null;
    this.currentPage = '';
  }

  init() {
    const path = window.location.pathname;
    this.currentPage = path.split('/').pop().replace('.html', '') || 'index';
    if (typeof permManager !== 'undefined') {
      permManager.onPermissionsLoaded(() => {
        this.render();
        this.setupMobile();
      });
    }
  }

  render() {
    const visibleMenu = permManager.getVisibleMenu();
    if (!visibleMenu.length) return;

    const sections = {
      'utama': { label: 'UTAMA', items: [] },
      'transaksi': { label: 'TRANSAKSI', items: [] },
      'laporan': { label: 'LAPORAN', items: [] },
      'integrasi': { label: 'INTEGRASI', items: [] },
      'sistem': { label: 'SISTEM', items: [] }
    };

    visibleMenu.forEach(item => {
      if (sections[item.section]) sections[item.section].items.push(item);
    });

    let html = '<div class="sidebar-brand"><div class="brand-icon">🛒</div><div class="brand-text">WebPOS</div></div><div class="sidebar-menu">';

    Object.entries(sections).forEach(([key, section]) => {
      if (section.items.length === 0) return;
      html += `<div class="nav-section"><div class="nav-section-title">${section.label}</div>`;

      section.items.forEach(item => {
        const isActive = this.isActivePage(item.perm);
        const activeClass = isActive ? 'active' : '';

        if (item.hasDropdown) {
          const dropdownOpen = isActive ? 'open' : '';
          html += `<div class="nav-item dropdown ${dropdownOpen}" data-dropdown="kas"><a href="#" class="nav-link ${activeClass}" onclick="sidebarRenderer.toggleDropdown(event, 'kas')"><span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span><span class="dropdown-arrow">▼</span></a><div class="dropdown-menu">`;
          const kasItems = permManager.getKasDropdownItems();
          kasItems.forEach(ki => {
            const kasActive = this.currentPage.includes(ki.id.replace(/-/g, ''));
            html += `<a href="${ki.page}" class="dropdown-item ${kasActive ? 'active' : ''}">${ki.label}</a>`;
          });
          html += '</div></div>';
        } else {
          const pageMap = {
            'dashboard': 'index.html', 'kasir': 'kasir.html', 'produk': 'produk.html',
            'riwayat_transaksi': 'riwayat.html', 'pembelian': 'pembelian.html',
            'hutang_piutang': 'hutang.html', 'laporan_penjualan': 'laporan-penjualan.html',
            'laporan_stok': 'laporan-stok.html', 'barang_terlaris': 'barang-terlaris.html',
            'saldo_telegram': 'saldo-telegram.html', 'data_pelanggan': 'pelanggan.html',
            'pengguna': 'pengguna.html', 'pengaturan': 'pengaturan.html',
            'backup_sync': 'backup.html', 'log_aktivitas': 'log-aktivitas.html',
            'printer_struk': 'printer-struk.html', 'reset_data': 'reset-data.html',
            'developer_zone': 'developer.html'
          };
          const pageUrl = pageMap[item.perm] || '#';
          const dangerClass = item.danger ? 'danger' : '';
          const devClass = item.devOnly ? 'dev-only' : '';
          html += `<div class="nav-item ${dangerClass} ${devClass}"><a href="${pageUrl}" class="nav-link ${activeClass}"><span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span></a></div>`;
        }
      });
      html += '</div>';
    });

    const profile = permManager.getProfile();
    html += `<div class="sidebar-footer"><div class="user-info"><div class="user-avatar">${(profile.nama || 'U').charAt(0).toUpperCase()}</div><div class="user-details"><div class="user-name">${profile.nama || 'User'}</div><div class="user-role">${permManager.getRole().toUpperCase()}</div></div></div><button class="logout-btn" onclick="sidebarRenderer.logout()"><span>🚪</span> Logout</button></div></div>`;

    this.sidebar = document.getElementById('sidebar');
    if (this.sidebar) this.sidebar.innerHTML = html;
  }

  toggleDropdown(e, dropdownId) {
    e.preventDefault();
    const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);
    if (dropdown) dropdown.classList.toggle('open');
  }

  isActivePage(perm) {
    const pageMap = {
      'dashboard': ['index', 'dashboard'], 'kasir': ['kasir'], 'produk': ['produk'],
      'riwayat_transaksi': ['riwayat'], 'kas_management': ['kas', 'modal', 'topup', 'tarik', 'closing', 'shift'],
      'pembelian': ['pembelian'], 'hutang_piutang': ['hutang'],
      'laporan_penjualan': ['laporan-penjualan'], 'laporan_stok': ['laporan-stok'],
      'barang_terlaris': ['barang-terlaris'], 'saldo_telegram': ['saldo-telegram'],
      'data_pelanggan': ['pelanggan'], 'pengguna': ['pengguna'],
      'pengaturan': ['pengaturan'], 'backup_sync': ['backup'],
      'log_aktivitas': ['log-aktivitas'], 'printer_struk': ['printer-struk'],
      'reset_data': ['reset-data'], 'developer_zone': ['developer']
    };
    const keywords = pageMap[perm] || [perm];
    return keywords.some(k => this.currentPage.includes(k));
  }

  setupMobile() {
    this.mobileToggle = document.getElementById('sidebarToggle');
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
      });
    }
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebarToggle');
        if (sidebar && toggle && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
          document.body.classList.remove('sidebar-open');
        }
      }
    });
  }

  async logout() {
    if (confirm('Yakin ingin logout?')) {
      try {
        await firebase.auth().signOut();
        localStorage.removeItem('webpos_permissions_cache');
        localStorage.removeItem('webpos_theme_cache');
        window.location.href = 'login.html';
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  }
}

const sidebarRenderer = new SidebarRenderer();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => sidebarRenderer.init());
} else {
  sidebarRenderer.init();
}

if (typeof module !== 'undefined') module.exports = { SidebarRenderer, sidebarRenderer };
