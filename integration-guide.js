/**
 * ============================================================
 * WEBPOS - THEME INTEGRATION GUIDE
 * Cara menghubungkan sistem tema baru ke WebPOS existing
 * ============================================================
 */

// ═══════════════════════════════════════════════════════════
// STEP 1: TAMBAHKAN CSS & JS DI SETIAP PAGE
// ═══════════════════════════════════════════════════════════

/*
Di <head> setiap HTML page (kasir.html, produk.html, dll):

<link rel="stylesheet" href="themes.css">

Di sebelum </body>:
<script src="settings-structure.js"></script>
<script src="theme-manager.js"></script>
<script src="utils.js"></script>  // kalau ada

*/

// ═══════════════════════════════════════════════════════════
// STEP 2: INISIALISASI THEME SAAT PAGE LOAD
// ═══════════════════════════════════════════════════════════

// Tambahkan di setiap file JS utama atau di utils.js:

document.addEventListener('DOMContentLoaded', () => {
  // ThemeManager akan otomatis load dari Firebase setelah auth
  // Tapi untuk load cepat dari cache:
  const cached = localStorage.getItem('webpos_theme_cache');
  if (cached) {
    try {
      const c = JSON.parse(cached);
      document.documentElement.setAttribute('data-theme', c.theme || 'ocean');
      document.documentElement.setAttribute('data-dark', c.darkMode ? 'true' : 'false');
      document.documentElement.style.setProperty('--font-scale', c.fontScale || 1);
      document.documentElement.style.setProperty('--radius', c.borderRadius || '12px');
    } catch(e) {}
  }
});

// ═══════════════════════════════════════════════════════════
// STEP 3: GANTI STATIC COLORS MENJADI CSS VARIABLES
// ═══════════════════════════════════════════════════════════

/*
GANTI SEMUA:
  background: #orange;  →  background: var(--primary);
  color: #333;          →  color: var(--text-main);
  border: 1px solid #ddd; → border: 1px solid var(--border);

CONTOH PERUBAHAN DI CSS EXISTING:

SEBELUM:
  .sidebar { background: #1a237e; }
  .btn-primary { background: #ff6f00; }
  .card { background: white; border: 1px solid #e0e0e0; }

SESUDAH:
  .sidebar { background: var(--gradient-sidebar); }
  .btn-primary { background: var(--gradient-header); }
  .card { background: var(--bg-card); border: 1px solid var(--border); }

*/

// ═══════════════════════════════════════════════════════════
// STEP 4: GANTI PEMANGGIL TEMA LAMA DI MENU SETTING
// ═══════════════════════════════════════════════════════════

/*
SEBELUM (di page-setting lama):
  - Ada input untuk warna manual
  - Ada toggle darkmode terpisah
  - Setting struk di page kasir
  - Setting bluetooth di page kasir

SESUDAH:
  - Semua pindah ke settings-ui.html
  - Link dari sidebar: <a href="settings-ui.html">Pengaturan</a>
  - Hapus setting-setting lama yang terpisah

*/

// ═══════════════════════════════════════════════════════════
// STEP 5: RECEIPT FORMAT - PANGGIL DARI SETTINGS
// ═══════════════════════════════════════════════════════════

// Di kasir-main.js atau file print:
function getReceiptConfig() {
  // Priority: Firebase > localStorage > Default
  const local = localStorage.getItem('webpos_settings_local');
  let settings = null;

  if (typeof themeManager !== 'undefined' && themeManager.settings) {
    settings = themeManager.settings;
  } else if (local) {
    try { settings = JSON.parse(local); } catch(e) {}
  }

  return settings?.receipt || DEFAULT_SETTINGS?.receipt || {
    header: { storeName: 'NAMA TOKO', storeAddress: '', storePhone: '' },
    footer: { thankYouText: 'Terima Kasih', footerNote: '' },
    format: { paperWidth: '58mm', fontSize: 'normal' }
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 6: BLUETOOTH CONFIG - PANGGIL DARI SETTINGS
// ═══════════════════════════════════════════════════════════

function getBluetoothConfig() {
  const local = localStorage.getItem('webpos_settings_local');
  let settings = null;

  if (typeof themeManager !== 'undefined' && themeManager.settings) {
    settings = themeManager.settings;
  } else if (local) {
    try { settings = JSON.parse(local); } catch(e) {}
  }

  return settings?.bluetooth || DEFAULT_SETTINGS?.bluetooth || {
    printerName: '', macAddress: '', autoConnect: false, paperWidth: '58mm'
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 7: HELPER UNTUK PRINT STRUK
// ═══════════════════════════════════════════════════════════

async function printReceipt(transactionData) {
  const config = getReceiptConfig();
  const btConfig = getBluetoothConfig();

  // Build struk text
  let struk = [];
  struk.push('CENTER');
  struk.push(config.header.storeName.toUpperCase());
  if (config.header.storeAddress) struk.push(config.header.storeAddress);
  if (config.header.storePhone) struk.push('Telp: ' + config.header.storePhone);
  struk.push('--------------------------------');
  struk.push('LEFT');

  // ... items ...

  struk.push('--------------------------------');
  struk.push('CENTER');
  struk.push(config.footer.thankYouText);
  if (config.footer.footerNote) struk.push(config.footer.footerNote);

  // Kirim ke printer
  if (btConfig.autoConnect && btConfig.macAddress) {
    await connectBluetoothPrinter(btConfig.macAddress);
  }

  await sendToPrinter(struk.join('\n'));
}

// ═══════════════════════════════════════════════════════════
// STEP 8: TAMBAHKAN DI SIDEBAR NAVIGASI
// ═══════════════════════════════════════════════════════════

/*
Tambahkan di nav-config atau sidebar HTML:

<li class="nav-item">
  <a href="settings-ui.html" class="nav-link">
    <i class="icon">⚙️</i>
    <span>Pengaturan</span>
  </a>
</li>

Menu Setting lama (yang terpisah2) bisa dihapus/diganti link-nya ke settings-ui.html
*/

// ═══════════════════════════════════════════════════════════
// CATATAN PENTING
// ═══════════════════════════════════════════════════════════

/*
1. Jangan hapus CSS lama langsung - tambahkan themes.css SEBAGAI tambahan
   dan gradually ganti class yang pakai static colors.

2. ThemeManager akan otomatis sync ke semua tab/browser yang terbuka
   karena pakai Firebase Realtime Database.

3. Untuk offline mode: cache di localStorage akan tetap apply tema
   meski tidak ada internet.

4. Jika ada page yang belum pakai CSS variables, akan tetap tampil
   dengan warna lama - tidak error.

5. Struktur Firebase baru:
   /settings/{uid}/
     ├── theme/...
     ├── receipt/...
     ├── bluetooth/...
     └── general/...

   TIDAK lagi menyebar di:
   - /users/{uid}/theme
   - /config/receipt
   - /printer/settings

   SEMUA DISATUKAN DI /settings/{uid}/
*/
