/**
 * ============================================================
 * WEBPOS - SETTINGS STRUCTURE (Firebase Realtime Database)
 * ============================================================
 * Path: /settings/{uid}/
 * Semua konfigurasi UI/UX disentralisasi di sini
 */

const DEFAULT_SETTINGS = {
  // ─── THEME & APPEARANCE ───
  theme: {
    activeTheme: "ocean",        // ocean | forest | sunset | royal | rose | cyber | slate
    darkMode: false,             // true | false
    sidebarStyle: "compact",       // compact | expanded | icon-only
    borderRadius: "12px",        // 8px | 12px | 16px | 24px
    fontScale: 1.0                 // 0.9 | 1.0 | 1.1 | 1.2
  },

  // ─── RECEIPT / STRUK CONFIG ───
  receipt: {
    header: {
      storeName: "NAMA TOKO ANDA",
      storeAddress: "Alamat Toko",
      storePhone: "0812-3456-7890",
      storeEmail: "",
      logoUrl: "",               // URL logo (opsional)
      showLogo: false
    },
    footer: {
      thankYouText: "Terima Kasih Atas Kunjungan Anda",
      footerNote: "Barang yang sudah dibeli tidak dapat ditukar/dikembalikan",
      showBarcode: false,
      showQrCode: false
    },
    format: {
      paperWidth: "58mm",          // 58mm | 80mm
      fontSize: "normal",          // small | normal | large
      copies: 1,                   // 1-3
      autoPrint: false,
      showTaxDetails: true
    }
  },

  // ─── BLUETOOTH PRINTER ───
  bluetooth: {
    printerName: "",               // Nama printer yang tersimpan
    macAddress: "",                // MAC address printer
    autoConnect: false,            // Auto connect saat buka kasir
    paperWidth: "58mm",            // 58mm | 80mm
    charset: "UTF-8",              // UTF-8 | ASCII
    density: "normal"              // light | normal | dark
  },

  // ─── GENERAL ───
  general: {
    language: "id",                // id | en
    currency: "IDR",               // IDR | USD
    dateFormat: "DD/MM/YYYY HH:mm",
    timezone: "Asia/Jakarta",
    lowStockAlert: 10,             // Alert stok menipis
    sessionTimeout: 30             // Menit (0 = tidak timeout)
  }
};

// Helper: Load settings dari Firebase
async function loadSettings(uid) {
  const snapshot = await firebase.database().ref(`settings/${uid}`).once('value');
  const data = snapshot.val() || {};
  return mergeDeep(DEFAULT_SETTINGS, data);
}

// Helper: Save settings ke Firebase
async function saveSettings(uid, settings) {
  return await firebase.database().ref(`settings/${uid}`).update(settings);
}

// Helper: Merge object deeply
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Export
if (typeof module !== 'undefined') module.exports = { DEFAULT_SETTINGS, loadSettings, saveSettings };
