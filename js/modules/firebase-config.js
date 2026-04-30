/**
 * ===================================================================
 * FILE    : js/modules/firebase-config.js
 * FUNGSI  : Konfigurasi Firebase RTDB + Helper CRUD untuk setiap node
 * PENYIMPANAN: 
 *   - Users        → /users/{uid}
 *   - Usernames    → /usernames/{username}  (mapping username→uid)
 *   - Produk       → /produk/{id}
 *   - Transaksi    → /transaksi/{id}
 *   - Transaksi Kas→ /transaksi_kas/{id}
 *   - Pembelian    → /pembelian/{id}
 *   - Hutang       → /hutang/{id}
 *   - Pelanggan    → /pelanggan/{id}
 *   - Pengaturan   → /pengaturan/
 *   - Log Aktivitas→ /log_aktivitas/{id}
 * DEPENDENSI: Firebase SDK (Realtime Database v9 compat)
 * CATATAN: Ganti placeholder config di bawah dengan config project Firebase Anda
 * ===================================================================
 */

// ===================== CONFIG FIREBASE =====================
// ⚠️ GANTI INI DENGAN CONFIG FIREBASE PROJECT ANDA
const firebaseConfig = {
  apiKey: "AIzaSyCSC05MTnaiiSftj1TA-LVCH4ymHBAbkoU",
  authDomain: "hifzicell-v2.firebaseapp.com",
  databaseURL: "https://hifzicell-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hifzicell-v2",
  storageBucket: "hifzicell-v2.firebasestorage.app",
  messagingSenderId: "766095621773",
  appId: "1:766095621773:web:da40a79eab0f573683acc4",
  measurementId: "G-N9B9PKFCHT"
};

// Inisialisasi Firebase (gunakan compat mode agar tidak perlu module bundler)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const auth = firebase.auth();

// ===================== HELPER DATABASE =====================

/**
 * DB_USERS
 * Fungsi  : CRUD data user & mapping username
 * Simpan  : /users/{uid}  dan  /usernames/{username}
 * Ambil   : /users/{uid} untuk cek role & menu_access
 */
const DB_USERS = {
  // Simpan user baru setelah register
  create: (uid, data) => db.ref(`users/${uid}`).set(data),
  // Mapping username → uid (untuk login)
  setUsername: (username, uid) => db.ref(`usernames/${username}`).set({ uid: uid }),
  // Ambil UID dari username
  getUidByUsername: (username) => db.ref(`usernames/${username}`).once('value').then(snap => snap.val()),
  // Ambil data user dari UID
  getByUid: (uid) => db.ref(`users/${uid}`).once('value').then(snap => snap.val()),
  // Update data user
  update: (uid, data) => db.ref(`users/${uid}`).update(data),
  // Cek apakah username sudah dipakai
  isUsernameExist: (username) => db.ref(`usernames/${username}`).once('value').then(snap => snap.exists())
};

/**
 * DB_PRODUK
 * Fungsi  : Master data barang
 * Simpan  : /produk/{produkId}
 * Ambil   : /produk/ untuk Kasir, Laporan Stok, Pembelian
 */
const DB_PRODUK = {
  create: (id, data) => db.ref(`produk/${id}`).set(data),
  update: (id, data) => db.ref(`produk/${id}`).update(data),
  remove: (id) => db.ref(`produk/${id}`).remove(),
  getAll: () => db.ref('produk').once('value').then(snap => snap.val() || {}),
  getById: (id) => db.ref(`produk/${id}`).once('value').then(snap => snap.val()),
  // Update stok setelah penjualan atau pembelian
  updateStok: (id, jumlah) => db.ref(`produk/${id}/stok`).transaction(stok => (stok || 0) + jumlah)
};

/**
 * DB_TRANSAKSI
 * Fungsi  : Penjualan dari Kasir
 * Simpan  : /transaksi/{transaksiId}
 * Ambil   : /transaksi/ untuk Dashboard, Riwayat, Laporan
 */
const DB_TRANSAKSI = {
  create: (id, data) => db.ref(`transaksi/${id}`).set(data),
  getAll: () => db.ref('transaksi').once('value').then(snap => snap.val() || {}),
  getByDate: (start, end) => {
    // Filter manual setelah ambil semua (Firebase RTDB tidak support query complex)
    return DB_TRANSAKSI.getAll().then(all => {
      const result = {};
      Object.keys(all).forEach(key => {
        const t = all[key];
        if (t.waktu >= start && t.waktu <= end) result[key] = t;
      });
      return result;
    });
  }
};

/**
 * DB_TRANSAKSI_KAS
 * Fungsi  : Kas masuk, keluar, tarik, topup, shift
 * Simpan  : /transaksi_kas/{id}
 * Ambil   : /transaksi_kas/ untuk Dashboard, Riwayat Kas
 * Jenis   : "masuk" | "keluar" | "tarik" | "topup" | "shift"
 */
const DB_TRANSAKSI_KAS = {
  create: (id, data) => db.ref(`transaksi_kas/${id}`).set(data),
  getAll: () => db.ref('transaksi_kas').once('value').then(snap => snap.val() || {}),
  getByJenis: (jenis) => DB_TRANSAKSI_KAS.getAll().then(all => {
    const result = {};
    Object.keys(all).forEach(key => {
      if (all[key].jenis === jenis) result[key] = all[key];
    });
    return result;
  })
};

/**
 * DB_PEMBELIAN
 * Fungsi  : Data pembelian barang dari supplier
 * Simpan  : /pembelian/{id}
 * Ambil   : /pembelian/ untuk Laporan Pembelian
 * Efek    : Otomatis update stok di /produk/{id}
 */
const DB_PEMBELIAN = {
  create: (id, data) => db.ref(`pembelian/${id}`).set(data),
  getAll: () => db.ref('pembelian').once('value').then(snap => snap.val() || {})
};

/**
 * DB_HUTANG
 * Fungsi  : Piutang pelanggan
 * Simpan  : /hutang/{id}
 * Ambil   : /hutang/ untuk Dashboard, Riwayat Hutang
 * Link    : pelanggan_id mengarah ke /pelanggan/{id}
 */
const DB_HUTANG = {
  create: (id, data) => db.ref(`hutang/${id}`).set(data),
  update: (id, data) => db.ref(`hutang/${id}`).update(data),
  getAll: () => db.ref('hutang').once('value').then(snap => snap.val() || {}),
  getByPelanggan: (pelangganId) => DB_HUTANG.getAll().then(all => {
    const result = {};
    Object.keys(all).forEach(key => {
      if (all[key].pelanggan_id === pelangganId) result[key] = all[key];
    });
    return result;
  })
};

/**
 * DB_PELANGGAN
 * Fungsi  : Master data pelanggan
 * Simpan  : /pelanggan/{id}
 * Ambil   : /pelanggan/ untuk Kasir (pilih pelanggan) & Hutang
 */
const DB_PELANGGAN = {
  create: (id, data) => db.ref(`pelanggan/${id}`).set(data),
  update: (id, data) => db.ref(`pelanggan/${id}`).update(data),
  remove: (id) => db.ref(`pelanggan/${id}`).remove(),
  getAll: () => db.ref('pelanggan').once('value').then(snap => snap.val() || {}),
  getById: (id) => db.ref(`pelanggan/${id}`).once('value').then(snap => snap.val())
};

/**
 * DB_PENGATURAN
 * Fungsi  : Semua setting aplikasi (tema, printer, header struk, toko)
 * Simpan  : /pengaturan/{kategori}
 * Ambil   : /pengaturan/ dibaca oleh SEMUA PAGE saat load
 * Struktur:
 *   /pengaturan/app       → nama_toko, alamat, telepon, tema_aktif
 *   /pengaturan/printer   → uuid, paper_width, auto_print
 *   /pengaturan/tema      → daftar tema & warna
 *   /pengaturan/struk     → header, footer
 */
const DB_PENGATURAN = {
  getApp: () => db.ref('pengaturan/app').once('value').then(snap => snap.val() || {}),
  setApp: (data) => db.ref('pengaturan/app').update(data),
  getPrinter: () => db.ref('pengaturan/printer').once('value').then(snap => snap.val() || {}),
  setPrinter: (data) => db.ref('pengaturan/printer').update(data),
  getTema: () => db.ref('pengaturan/tema').once('value').then(snap => snap.val() || {}),
  setTema: (data) => db.ref('pengaturan/tema').update(data),
  getStruk: () => db.ref('pengaturan/struk').once('value').then(snap => snap.val() || {}),
  setStruk: (data) => db.ref('pengaturan/struk').update(data)
};

/**
 * DB_LOG
 * Fungsi  : Catatan aktivitas user (khusus developer/owner)
 * Simpan  : /log_aktivitas/{id}
 * Ambil   : /log_aktivitas/ (hanya role developer)
 */
const DB_LOG = {
  create: (id, data) => db.ref(`log_aktivitas/${id}`).set(data),
  getAll: () => db.ref('log_aktivitas').once('value').then(snap => snap.val() || {})
};

// ===================== UTILS GLOBAL =====================

/**
 * generateId()
 * Fungsi : Buat ID unik berbasis timestamp + random
 * Pakai  : Untuk semua node (transaksi, produk, hutang, dll)
 */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * formatRupiah(angka)
 * Fungsi : Format angka ke Rupiah
 */
function formatRupiah(angka) {
  if (angka === undefined || angka === null) return 'Rp 0';
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * nowTimestamp()
 * Fungsi : Waktu sekarang dalam format timestamp (ms)
 */
function nowTimestamp() {
  return Date.now();
}

/**
 * logAktivitas(userUid, aksi, detail)
 * Fungsi : Simpan log setiap aksi penting
 */
function logAktivitas(userUid, aksi, detail) {
  const id = generateId('log');
  DB_LOG.create(id, {
    user_uid: userUid,
    aksi: aksi,
    detail: detail,
    waktu: nowTimestamp()
  });
}

// ===================== EXPORT (Global) =====================
// Agar bisa dipakai di semua file lain
window.DB_USERS = DB_USERS;
window.DB_PRODUK = DB_PRODUK;
window.DB_TRANSAKSI = DB_TRANSAKSI;
window.DB_TRANSAKSI_KAS = DB_TRANSAKSI_KAS;
window.DB_PEMBELIAN = DB_PEMBELIAN;
window.DB_HUTANG = DB_HUTANG;
window.DB_PELANGGAN = DB_PELANGGAN;
window.DB_PENGATURAN = DB_PENGATURAN;
window.DB_LOG = DB_LOG;
window.generateId = generateId;
window.formatRupiah = formatRupiah;
window.nowTimestamp = nowTimestamp;
window.logAktivitas = logAktivitas;
window.db = db;
window.auth = auth;
