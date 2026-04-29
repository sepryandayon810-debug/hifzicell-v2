/**
 * ============================================================
 * WEBPOS - PERMISSION MANAGER v1.0
 * Load permissions dari Firebase, cek akses, render sidebar
 * Phase 1: Foundation Layer
 * ============================================================
 */

class PermissionManager {
  constructor() {
    this.permissions = {};
    this.role = '';
    this.uid = '';
    this.tokoId = '';
    this.userProfile = {};
    this.canManageUsers = false;
    this.listeners = [];
    this.loaded = false;
  }

  async init() {
    // Cek auth state
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          this.uid = user.uid;
          await this.loadFromFirebase();
        } else {
          // Redirect ke login kalau tidak auth
          if (!window.location.pathname.includes('login')) {
            window.location.href = 'login.html';
          }
        }
      });
    }
  }

  // ─── LOAD DARI FIREBASE ───
  async loadFromFirebase() {
    if (!this.uid) return;
    try {
      const snap = await firebase.database().ref(`users/${this.uid}`).once('value');
      const data = snap.val() || {};

      this.userProfile = data.profile || {};
      this.role = this.userProfile.role || 'kasir';
      this.tokoId = this.userProfile.tokoId || '';
      this.permissions = data.permissions || this.getDefaultPermissions(this.role);

      // Cek apakah user ini boleh mengatur permissions user lain
      this.canManageUsers = (
        this.role === 'owner' ||
        this.role === 'developer' ||
        (this.role === 'admin' && this.permissions.pengguna === true)
      );

      this.loaded = true;

      // Save ke localStorage untuk load cepat
      localStorage.setItem('webpos_permissions_cache', JSON.stringify({
        uid: this.uid,
        permissions: this.permissions,
        role: this.role,
        tokoId: this.tokoId,
        timestamp: Date.now()
      }));

      // Notify listeners
      this.notifyListeners();

      console.log('✅ Permissions loaded:', this.role, this.permissions);
    } catch (err) {
      console.error('❌ Gagal load permissions:', err);
      // Fallback ke cache
      this.loadFromCache();
    }
  }

  // ─── LOAD DARI CACHE ───
  loadFromCache() {
    const cached = localStorage.getItem('webpos_permissions_cache');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        this.permissions = data.permissions || {};
        this.role = data.role || 'kasir';
        this.tokoId = data.tokoId || '';
        this.uid = data.uid || '';
        this.loaded = true;
        this.canManageUsers = (
          this.role === 'owner' ||
          this.role === 'developer' ||
          (this.role === 'admin' && this.permissions.pengguna === true)
        );
        this.notifyListeners();
      } catch (e) {
        console.warn('Cache permissions rusak');
      }
    }
  }

  // ─── DEFAULT PERMISSIONS BY ROLE ───
  getDefaultPermissions(role) {
    const defaults = {
      owner: {
        dashboard: true, kasir: true, produk: true, pembelian: true,
        riwayat_transaksi: true, kas_management: true, hutang_piutang: true,
        laporan_penjualan: true, laporan_stok: true, barang_terlaris: true,
        saldo_telegram: true, data_pelanggan: true, pengguna: true,
        pengaturan: true, backup_sync: true, log_aktivitas: true,
        printer_struk: true, reset_data: true, developer_zone: false
      },
      admin: {
        dashboard: true, kasir: true, produk: true, pembelian: true,
        riwayat_transaksi: true, kas_management: true, hutang_piutang: true,
        laporan_penjualan: true, laporan_stok: true, barang_terlaris: true,
        saldo_telegram: true, data_pelanggan: true, pengguna: false,
        pengaturan: false, backup_sync: false, log_aktivitas: false,
        printer_struk: true, reset_data: false, developer_zone: false
      },
      kasir: {
        dashboard: true, kasir: true, produk: false, pembelian: false,
        riwayat_transaksi: true, kas_management: true, hutang_piutang: true,
        laporan_penjualan: false, laporan_stok: false, barang_terlaris: false,
        saldo_telegram: false, data_pelanggan: true, pengguna: false,
        pengaturan: false, backup_sync: false, log_aktivitas: false,
        printer_struk: true, reset_data: false, developer_zone: false
      },
      developer: {
        dashboard: true, kasir: true, produk: true, pembelian: true,
        riwayat_transaksi: true, kas_management: true, hutang_piutang: true,
        laporan_penjualan: true, laporan_stok: true, barang_terlaris: true,
        saldo_telegram: true, data_pelanggan: true, pengguna: true,
        pengaturan: true, backup_sync: true, log_aktivitas: true,
        printer_struk: true, reset_data: true, developer_zone: true
      }
    };
    return defaults[role] || defaults.kasir;
  }

  // ─── CEK AKSES KE FITUR ───
  canAccess(feature) {
    return this.permissions[feature] === true;
  }

  // ─── CEK BISA EDIT (bukan read-only) ───
  canEdit(feature) {
    if (!this.canAccess(feature)) return false;
    // Kasir read-only untuk beberapa fitur
    if (this.role === 'kasir') {
      const readOnly = ['produk', 'laporan_penjualan', 'laporan_stok', 'barang_terlaris'];
      if (readOnly.includes(feature)) return false;
    }
    return true;
  }

  // ─── CEK BOLEH ATUR PERMISSIONS USER LAIN ───
  canEditPermissions(targetRole) {
    if (!this.canManageUsers) return false;
    // Admin tidak boleh edit Owner atau Developer
    if (this.role === 'admin') {
      if (targetRole === 'owner' || targetRole === 'developer') return false;
    }
    return true;
  }

  // ─── GET VISIBLE MENU ───
  getVisibleMenu() {
    const menuMap = {
      'dashboard':       { label: 'Dashboard',          icon: '🏠', section: 'utama' },
      'kasir':           { label: 'Kasir',              icon: '🛒', section: 'utama' },
      'produk':          { label: 'Produk',             icon: '🍜', section: 'utama' },
      'riwayat_transaksi':{ label: 'Riwayat Transaksi', icon: '📜', section: 'transaksi' },
      'kas_management':  { label: 'Kas Management',     icon: '💰', section: 'transaksi', hasDropdown: true },
      'pembelian':       { label: 'Pembelian / Restock',icon: '📦', section: 'transaksi' },
      'hutang_piutang':  { label: 'Hutang & Piutang',   icon: '📋', section: 'transaksi' },
      'laporan_penjualan':{ label: 'Laporan Penjualan', icon: '📊', section: 'laporan' },
      'laporan_stok':    { label: 'Laporan Stok',       icon: '📊', section: 'laporan' },
      'barang_terlaris': { label: 'Barang Terlaris',    icon: '🏆', section: 'laporan' },
      'saldo_telegram':  { label: 'Saldo Telegram',     icon: '✈️', section: 'integrasi' },
      'data_pelanggan':  { label: 'Data Pelanggan',     icon: '👤', section: 'integrasi' },
      'pengguna':        { label: 'Pengguna',           icon: '👥', section: 'sistem' },
      'pengaturan':      { label: 'Pengaturan',         icon: '⚙️', section: 'sistem' },
      'backup_sync':     { label: 'Backup & Sync',      icon: '☁️', section: 'sistem' },
      'log_aktivitas':   { label: 'Log Aktivitas',      icon: '📜', section: 'sistem' },
      'printer_struk':   { label: 'Printer & Struk',    icon: '🖨️', section: 'sistem' },
      'reset_data':      { label: 'Reset Data',         icon: '🔄', section: 'sistem', danger: true },
      'developer_zone':  { label: 'Developer Zone',     icon: '🛠️', section: 'sistem', devOnly: true }
    };

    return Object.entries(menuMap)
      .filter(([perm]) => this.permissions[perm] === true)
      .map(([perm, config]) => ({ perm, ...config }));
  }

  // ─── GET KAS DROPDOWN ITEMS ───
  getKasDropdownItems() {
    return [
      { id: 'ringkasan-kas',  label: 'Ringkasan Kas',  page: 'kas-management.html' },
      { id: 'modal-harian',   label: 'Modal Harian',   page: 'modal-harian.html' },
      { id: 'kas-masuk',      label: 'Kas Masuk',      page: 'kas-masuk.html' },
      { id: 'kas-keluar',     label: 'Kas Keluar',     page: 'kas-keluar.html' },
      { id: 'kas-shift',      label: 'Kas & Shift',    page: 'kas-shift.html' },
      { id: 'closing-shift',  label: 'Closing Shift',  page: 'closing-shift.html' },
      { id: 'topup',          label: 'Top Up',         page: 'topup.html' },
      { id: 'tarik-tunai',    label: 'Tarik Tunai',    page: 'tarik-tunai.html' }
    ];
  }

  // ─── PROTECT PAGE ───
  protectPage(requiredPermission) {
    if (!this.loaded) {
      console.warn('Permissions belum load, tunggu...');
      return false;
    }
    if (!this.canAccess(requiredPermission)) {
      this.showToast('❌ Anda tidak memiliki akses ke halaman ini');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      return false;
    }
    return true;
  }

  // ─── TOAST ───
  showToast(msg, type = 'error') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 99999;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white; padding: 14px 20px; border-radius: 12px;
      font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ─── LISTENERS ───
  onPermissionsLoaded(callback) {
    if (this.loaded) {
      callback(this);
    } else {
      this.listeners.push(callback);
    }
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this); } catch(e) { console.error(e); }
    });
  }

  // ─── GETTERS ───
  getRole() { return this.role; }
  getUid() { return this.uid; }
  getTokoId() { return this.tokoId; }
  getProfile() { return this.userProfile; }
  isLoaded() { return this.loaded; }
}

// Singleton
const permManager = new PermissionManager();

// Auto init
if (typeof firebase !== 'undefined') {
  permManager.init();
}

// Export
if (typeof module !== 'undefined') module.exports = { PermissionManager, permManager };
