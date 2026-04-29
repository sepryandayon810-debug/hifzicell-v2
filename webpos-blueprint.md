🔷 WebPOS Database Blueprint v3.2
Full Dynamic Permissions — Semua hak akses diatur via checkbox oleh Owner/Developer
📑 Daftar Isi
Konsep Utama
Roles
Permissions
Struktur Database
Flow Data
Security Rules
Halaman Pengguna (UI)
Contoh Real Case
🎯 Konsep Utama
Table
❌ Salah	✅ Benar
"Kasir default tidak bisa akses Pembelian"	"Kasir BOLEH akses Pembelian kalau Owner centang"
"Admin tidak boleh Reset Data"	"Admin BOLEH Reset Data kalau Owner centang permission-nya"
Role menentukan akses	Permissions node menentukan akses
Role = Cuma label. Yang menentukan akses adalah /users/{uid}/permissions/.
👤 Roles
Table
Role	Deskripsi	Bisa Atur Permissions?
Owner	Pemilik toko	✅ Bisa atur SEMUA user
Admin	Manajer toko	✅ Bisa atur Kasir & Admin lain (tidak boleh atur Owner)
Kasir	Operasional	❌ Tidak bisa atur permissions (hanya pakai)
Developer	Teknisi	✅ Bisa atur SEMUA user + akses Developer Zone
🔐 Permissions
Semua Fitur (19 total)
plain
Copy
☑️  🏠  Dashboard
☑️  🛒  Kasir
☑️  🍜  Produk
☑️  📦  Pembelian / Restock
☑️  📜  Riwayat Transaksi
☑️  💰  Kas Management
☑️  📋  Hutang & Piutang
☑️  📊  Laporan Penjualan
☑️  📊  Laporan Stok
☑️  🏆  Barang Terlaris
☑️  ✈️  Saldo Telegram
☑️  👤  Data Pelanggan
☑️  👥  Pengguna          ← 🔒 Hanya Owner/Developer bisa centang
☑️  ⚙️  Pengaturan        ← 🔒 Hanya Owner/Developer bisa centang
☑️  ☁️  Backup & Sync     ← 🔒 Hanya Owner/Developer bisa centang
☑️  📜  Log Aktivitas     ← 🔒 Hanya Owner/Developer bisa centang
☑️  🖨️  Printer & Struk
☑️  🔄  Reset Data        ← 🔒 Hanya Owner/Developer bisa centang
☑️  🛠️  Developer Zone    ← 🔒 Hanya Developer bisa centang
🔒 Fitur yang Dikunci (siapa yang boleh centang)
Table
Fitur	Owner	Admin	Developer
👥 Pengguna	✅	❌	✅
⚙️ Pengaturan	✅	❌	✅
☁️ Backup & Sync	✅	❌	✅
📜 Log Aktivitas	✅	❌	✅
🔄 Reset Data	✅	❌	✅
🛠️ Developer Zone	❌	❌	✅
Admin tidak boleh centang fitur 🔒, tapi Owner/Developer BISA kasih Admin akses ke fitur tersebut.
🗄️ Struktur Database
Root: https://webpos-default-rtdb.firebaseio.com/
plain
Copy
webpos-rtdb/
│
├── 📁 users/{uid}/
│   ├── profile/
│   │   ├── nama: "Andi"
│   │   ├── email: "andi@toko.com"
│   │   ├── phone: "08123456789"
│   │   ├── role: "kasir"              // owner | admin | kasir | developer
│   │   ├── tokoId: "toko_001"
│   │   ├── createdBy: "uid_owner_123"
│   │   ├── createdAt: 1714392000000
│   │   └── lastLogin: 1714392000000
│   │
│   ├── permissions/                   // ⭐ DIATUR VIA CHECKBOX
│   │   ├── dashboard: true
│   │   ├── kasir: true
│   │   ├── produk: false
│   │   ├── pembelian: false
│   │   ├── riwayat_transaksi: true
│   │   ├── kas_management: true
│   │   ├── hutang_piutang: true
│   │   ├── laporan_penjualan: false
│   │   ├── laporan_stok: false
│   │   ├── barang_terlaris: false
│   │   ├── saldo_telegram: false
│   │   ├── data_pelanggan: true
│   │   ├── pengguna: false            // 🔒
│   │   ├── pengaturan: false          // 🔒
│   │   ├── backup_sync: false         // 🔒
│   │   ├── log_aktivitas: false       // 🔒
│   │   ├── printer_struk: true
│   │   ├── reset_data: false          // 🔒
│   │   └── developer_zone: false      // 🔒
│   │
│   └── sessions/{sessionId}/
│       ├── device: "Android Xiaomi"
│       ├── ip: "182.1.x.x"
│       ├── loginAt: 1714392000000
│       └── active: true
│
├── 📁 permissions_template/
│   ├── owner/     { ... semua true ... }
│   ├── admin/     { ... reset_data: false, pengguna: false ... }
│   ├── kasir/     { ... terbatas ... }
│   └── developer/ { ... + developer_zone: true ... }
│
├── 📁 toko/{tokoId}/
│   ├── info/
│   │   ├── nama: "Toko Sejahtera"
│   │   ├── alamat: "Jl. Mawar No. 12"
│   │   ├── telepon: "08123456789"
│   │   ├── email: "toko@email.com"
│   │   ├── logoUrl: ""
│   │   ├── createdAt: 1714392000000
│   │   └── ownerUid: "uid_owner_123"
│   ├── cabang/{cabangId}/
│   └── settings/
│       ├── defaultTax: 0.11
│       ├── currency: "IDR"
│       └── timezone: "Asia/Jakarta"
│
├── 📁 produk/{tokoId}/
│   └── {produkId}/
│       ├── kode: "BRG001"
│       ├── nama: "Indomie Goreng"
│       ├── kategori: "Makanan"
│       ├── hargaBeli: 2500
│       ├── hargaJual: 3500
│       ├── stok: 100
│       ├── stokMin: 10
│       ├── satuan: "pcs"
│       ├── barcode: "8998866201234"
│       ├── unlimited: false
│       ├── layakJual: true
│       ├── gambarUrl: ""
│       ├── supplier: "PT Indofood"
│       ├── createdAt: 1714392000000
│       └── updatedAt: 1714392000000
│
├── 📁 transaksi/{tokoId}/
│   ├── {transaksiId}/
│   │   ├── invoice: "INV-240426-001"
│   │   ├── timestamp: 1714392000000
│   │   ├── tanggal: "26/04/2026"
│   │   ├── waktu: "14:30"
│   │   ├── kasirUid: "uid_kasir_123"
│   │   ├── kasirNama: "Andi"
│   │   ├── pelangganId: "pel_001"
│   │   ├── pelangganNama: "Pak Budi"
│   │   ├── items/
│   │   │   └── {index}/
│   │   │       ├── produkId: "prod_001"
│   │   │       ├── kode: "BRG001"
│   │   │       ├── nama: "Indomie Goreng"
│   │   │       ├── hargaSatuan: 3500
│   │   │       ├── qty: 2
│   │   │       ├── diskon: 0
│   │   │       ├── subtotal: 7000
│   │   │       └── unlimited: false
│   │   ├── pembayaran/
│   │   │   ├── metode: "tunai"        // tunai | qris | transfer | hutang
│   │   │   ├── total: 15000
│   │   │   ├── diskonTotal: 0
│   │   │   ├── ppn: 1650
│   │   │   ├── grandTotal: 16650
│   │   │   ├── bayar: 20000
│   │   │   ├── kembalian: 3350
│   │   │   └── catatan: ""
│   │   ├── status: "completed"        // completed | hold | cancelled | refunded
│   │   ├── shiftId: "shift_001"
│   │   ├── printed: false
│   │   ├── strukShared: false
│   │   └── syncedToSheet: false
│   └── hold/{holdId}/
│       ├── nama: "Meja 3"
│       ├── items: [...]
│       ├── totalSementara: 45000
│       ├── waktuHold: 1714392000000
│       └── kasirUid: "uid_123"
│
├── 📁 kas/{tokoId}/
│   ├── modal/{modalId}/
│   │   ├── tanggal: "26/04/2026"
│   │   ├── jumlah: 500000
│   │   ├── keterangan: "Modal awal hari"
│   │   ├── kasirUid: "uid_123"
│   │   ├── kasirNama: "Andi"
│   │   └── createdAt: 1714392000000
│   ├── kas_masuk/{id}/
│   │   ├── tanggal: "26/04/2026"
│   │   ├── jumlah: 100000
│   │   ├── sumber: "Top Up Saldo"
│   │   ├── keterangan: "Top up dari owner"
│   │   ├── kasirUid: "uid_123"
│   │   └── createdAt: 1714392000000
│   ├── kas_keluar/{id}/
│   │   ├── tanggal: "26/04/2026"
│   │   ├── jumlah: 50000
│   │   ├── tujuan: "Beli ATK"
│   │   ├── keterangan: "Pembelian pulpen"
│   │   ├── kasirUid: "uid_123"
│   │   └── createdAt: 1714392000000
│   ├── topup/{id}/
│   ├── tarik_tunai/{id}/
│   ├── shift/{shiftId}/
│   │   ├── kasirUid: "uid_123"
│   │   ├── kasirNama: "Andi"
│   │   ├── tanggal: "26/04/2026"
│   │   ├── jamBuka: "08:00"
│   │   ├── jamTutup: "17:00"
│   │   ├── modalAwal: 500000
│   │   ├── totalPenjualan: 2500000
│   │   ├── totalTransaksi: 45
│   │   ├── totalKasMasuk: 100000
│   │   ├── totalKasKeluar: 50000
│   │   ├── saldoAkhir: 3050000
│   │   ├── status: "closed"           // open | closed
│   │   └── transferredTo: ""
│   └── ringkasan_harian/{tanggal}/
│       ├── modalAwal: 500000
│       ├── totalPenjualan: 2500000
│       ├── totalKasMasuk: 100000
│       ├── totalKasKeluar: 50000
│       ├── totalHutangMasuk: 0
│       ├── saldoAkhir: 3050000
│       └── jumlahTransaksi: 45
│
├── 📁 hutang/{tokoId}/
│   ├── daftar/{hutangId}/
│   │   ├── namaPelanggan: "Bram"
│   │   ├── noHp: "08123456789"
│   │   ├── totalHutang: 150000
│   │   ├── sudahBayar: 50000
│   │   ├── sisa: 100000
│   │   ├── status: "belum_lunas"      // belum_lunas | lunas
│   │   ├── transaksiIds: { "inv_001": true }
│   │   ├── createdAt: 1714392000000
│   │   └── updatedAt: 1714392000000
│   ├── pembayaran/{id}/
│   │   ├── hutangId: "hutang_001"
│   │   ├── namaPelanggan: "Bram"
│   │   ├── jumlahBayar: 50000
│   │   ├── metode: "tunai"
│   │   ├── tanggal: "26/04/2026"
│   │   ├── kasirUid: "uid_123"
│   │   └── createdAt: 1714392000000
│   └── piutang/{id}/
│       ├── namaSupplier: "PT Indofood"
│       ├── jumlah: 5000000
│       ├── sudahBayar: 2000000
│       ├── sisa: 3000000
│       ├── status: "belum_lunas"
│       └── jatuhTempo: "26/05/2026"
│
├── 📁 pembelian/{tokoId}/
│   └── {pembelianId}/
│       ├── noNota: "NB-240426-001"
│       ├── tanggal: "26/04/2026"
│       ├── supplier: "PT Indofood"
│       ├── items/
│       │   └── {index}/
│       │       ├── produkId: "prod_001"
│       │       ├── nama: "Indomie Goreng"
│       │       ├── hargaBeli: 2500
│       │       ├── qty: 100
│       │       ├── subtotal: 250000
│       │       ├── stokSebelum: 50
│       │       └── stokSesudah: 150
│       ├── total: 250000
│       ├── bayar: 250000
│       ├── metode: "tunai"
│       ├── status: "lunas"            // lunas | hutang | dicicil
│       ├── kasirUid: "uid_123"
│       └── createdAt: 1714392000000
│
├── 📁 pelanggan/{tokoId}/
│   └── {pelangganId}/
│       ├── nama: "Pak Budi"
│       ├── noHp: "08123456789"
│       ├── email: "budi@email.com"
│       ├── alamat: "Jl. Melati No. 5"
│       ├── totalBelanja: 2500000
│       ├── totalKunjungan: 25
│       ├── poin: 250
│       ├── tier: "silver"           // bronze | silver | gold
│       └── createdAt: 1714392000000
│
├── 📁 laporan/{tokoId}/
│   ├── harian/{tanggal}/
│   │   ├── totalPenjualan: 2500000
│   │   ├── totalTransaksi: 45
│   │   ├── totalItemTerjual: 120
│   │   ├── totalDiskon: 50000
│   │   ├── totalPpn: 275000
│   │   ├── totalModal: 500000
│   │   ├── totalKasMasuk: 100000
│   │   ├── totalKasKeluar: 50000
│   │   ├── labaKotor: 875000
│   │   ├── labaBersih: 600000
│   │   ├── jumlahTransaksi: 45
│   │   └── metodePembayaran/
│   │       ├── tunai: 1500000
│   │       ├── qris: 800000
│   │       └── hutang: 200000
│   ├── bulanan/{bulan}/
│   ├── produk_terlaris/{periode}/{produkId}/
│   │   ├── nama: "Indomie Goreng"
│   │   ├── totalTerjual: 500
│   │   ├── totalPendapatan: 1750000
│   │   └── rank: 1
│   └── stok/{produkId}/
│       ├── stokAwal: 100
│       ├── stokMasuk: 50
│       ├── stokKeluar: 120
│       ├── stokAkhir: 30
│       └── lastUpdated: 1714392000000
│
├── 📁 settings/{uid}/
│   ├── theme/
│   │   ├── activeTheme: "ocean"
│   │   ├── darkMode: false
│   │   ├── sidebarStyle: "compact"
│   │   ├── borderRadius: "12px"
│   │   └── fontScale: 1.0
│   ├── receipt/
│   │   ├── header/
│   │   │   ├── storeName: "Toko Sejahtera"
│   │   │   ├── storeAddress: "Jl. Mawar No. 12"
│   │   │   ├── storePhone: "08123456789"
│   │   │   ├── storeEmail: ""
│   │   │   ├── logoUrl: ""
│   │   │   └── showLogo: false
│   │   ├── footer/
│   │   │   ├── thankYouText: "Terima Kasih Atas Kunjungan Anda"
│   │   │   ├── footerNote: "Barang yang sudah dibeli tidak dapat ditukar"
│   │   │   ├── showBarcode: false
│   │   │   └── showQrCode: false
│   │   └── format/
│   │       ├── paperWidth: "58mm"
│   │       ├── fontSize: "normal"
│   │       ├── copies: 1
│   │       ├── autoPrint: false
│   │       └── showTaxDetails: true
│   ├── bluetooth/
│   │   ├── printerName: "XPrinter-58"
│   │   ├── macAddress: ""
│   │   ├── autoConnect: false
│   │   ├── paperWidth: "58mm"
│   │   ├── charset: "UTF-8"
│   │   └── density: "normal"
│   └── general/
│       ├── language: "id"
│       ├── currency: "IDR"
│       ├── dateFormat: "DD/MM/YYYY HH:mm"
│       ├── timezone: "Asia/Jakarta"
│       ├── lowStockAlert: 10
│       └── sessionTimeout: 30
│
├── 📁 backup/{tokoId}/
│   ├── lastSync/
│   │   ├── sheets: 1714392000000
│   │   ├── telegram: 1714392000000
│   │   └── local: 1714392000000
│   ├── logs/{logId}/
│   │   ├── tipe: "sync_sheets"
│   │   ├── status: "success"
│   │   ├── detail: "45 transaksi synced"
│   │   ├── timestamp: 1714392000000
│   │   └── kasirUid: "uid_123"
│   └── queue/{queueId}/
│       ├── tipe: "transaksi"
│       ├── data: { ... }
│       ├── retryCount: 0
│       └── createdAt: 1714392000000
│
├── 📁 logs/{tokoId}/
│   └── {logId}/
│       ├── tipe: "transaksi_baru"
│       ├── userUid: "uid_123"
│       ├── userNama: "Andi"
│       ├── userRole: "kasir"
│       ├── deskripsi: "Menambah transaksi INV-240426-001"
│       ├── dataLama: { ... }
│       ├── dataBaru: { ... }
│       ├── ipAddress: "182.1.x.x"
│       ├── device: "Android Xiaomi"
│       └── timestamp: 1714392000000
│
├── 📁 telegram/{tokoId}/
│   ├── config/
│   │   ├── botToken: "***ENCRYPTED***"
│   │   ├── chatId: "-100123456789"
│   │   └── enabled: true
│   ├── saldo/
│   │   ├── saldoAwal: 100000
│   │   ├── saldoMasuk: 50000
│   │   ├── saldoKeluar: 20000
│   │   └── saldoAkhir: 130000
│   └── notifikasi/{notifId}/
│       ├── tipe: "stok_menipis"
│       ├── pesan: "Stok Indomie tinggal 5 pcs!"
│       ├── status: "terkirim"
│       └── timestamp: 1714392000000
│
└── 📁 developer/{tokoId}/
    ├── analytics/
    │   ├── totalUsers: 5
    │   ├── activeToday: 3
    │   ├── avgTransaksiPerHari: 45
    │   └── errorLogs/{errorId}/
    │       ├── file: "kasir-main.js"
    │       ├── line: 245
    │       ├── message: "TypeError..."
    │       ├── userAgent: "Mozilla/5.0..."
    │       └── timestamp: 1714392000000
    ├── flags/
    │   ├── fiturHutang: true
    │   ├── fiturShift: true
    │   ├── fiturTelegram: true
    │   └── betaMode: false
    └── config/
        ├── firebaseUrl: "..."
        ├── sheetId: "..."
        ├── n8nWebhook: "..."
        └── apiKeys/{keyId}/
            ├── nama: "Google Sheets API"
            └── value: "***ENCRYPTED***"
🔄 Flow Data
plain
Copy
[1] Kasir Input Transaksi
        ↓
[2] Simpan ke /transaksi/{tokoId}/{transaksiId}
        ↓
[3] Update stok di /produk/{tokoId}/{produkId}/stok
        ↓
[4] Update laporan harian di /laporan/{tokoId}/harian/{tanggal}
        ↓
[5] Kirim notifikasi Telegram (jika enabled)
        ↓
[6] Sync ke Google Sheets (via n8n/GAS)
        ↓
[7] Cetak struk (gunakan config dari /settings/{uid}/receipt)
        ↓
[8] Log aktivitas di /logs/{tokoId}/{logId}
Shift Flow
plain
Copy
[1] Kasir buka shift → /kas/shift/{shiftId} (status: "open")
        ↓
[2] Kasir transaksi seharian
        ↓
[3] Kasir closing shift → update jamTutup, hitung saldoAkhir
        ↓
[4] Transfer shift ke owner (opsional)
        ↓
[5] Update ringkasan harian
🔒 Security Rules
Lihat file terpisah: ./firebase-rules.json
Aturan Utama
Read/Write semua data node → berdasarkan permissions user, BUKAN role
Hanya Owner & Developer yang boleh edit /users/{uid}/permissions/
Admin boleh edit permissions Kasir & Admin lain, tapi TIDAK BOLEH edit Owner/Developer
Kasir tidak boleh edit permissions (hanya read data sendiri)
Logs hanya bisa ditulis oleh Cloud Function
Developer Zone hanya bisa diakses user dengan developer_zone: true
🖥️ Halaman Pengguna (UI)
Modal Edit Permissions
plain
Copy
User: Andi (Kasir)

┌─ UTAMA ─────────────────────────┐  ┌─ LAPORAN ───────────────────────┐
│ ☑️ 🏠 Dashboard                │  │ ☐  📊 Laporan Penjualan         │
│ ☑️ 🛒 Kasir                    │  │ ☐  📊 Laporan Stok              │
│ ☐  🍜 Produk                   │  │ ☐  🏆 Barang Terlaris           │
│ ☐  📦 Pembelian                │  └─────────────────────────────────┘
│ ☑️ 📜 Riwayat Transaksi        │  ┌─ SISTEM ────────────────────────┐
│ ☑️ 💰 Kas Management           │  │ ☐  👥 Pengguna     🔒           │
│ ☑️ 📋 Hutang & Piutang         │  │ ☐  ⚙️ Pengaturan   🔒           │
└─────────────────────────────────┘  │ ☐  ☁️ Backup & Sync  🔒         │
┌─ INTEGRASI ───────────────────┐  │ ☐  📜 Log Aktivitas  🔒         │
│ ☐  ✈️ Saldo Telegram           │  │ ☑️ 🖨️ Printer & Struk           │
│ ☑️ 👤 Data Pelanggan           │  │ ☐  🔄 Reset Data   🔒           │
└─────────────────────────────────┘  │ ☐  🛠️ Developer Zone 🔒         │
                                       └─────────────────────────────────┘

🔒 = Hanya Owner/Developer yang bisa centang/uncentang
📋 Contoh Real Case
Case 1: Kasir dengan Akses Laporan
Owner centang untuk Andi (Kasir):
✅ Laporan Penjualan
✅ Laporan Stok
✅ Barang Terlaris
Hasil: Andi BISA lihat laporan, tapi read-only (tidak bisa edit).
Case 2: Admin dengan Akses Pengaturan
Owner centang untuk Budi (Admin):
✅ Pengaturan
Hasil: Budi BISA buka halaman Pengaturan dan ubah tema/struk/bluetooth.
Case 3: Kasir dengan Akses Pembelian
Owner centang untuk Andi (Kasir):
✅ Pembelian
Hasil: Andi BISA buka halaman Pembelian/Restock (biasanya tidak).
📦 File Terkait
Table
File	Deskripsi
./firebase-rules.json	Security Rules siap copy-paste ke Firebase Console
../src/js/settings-structure.js	Default settings object
../src/js/theme-manager.js	Theme controller
../src/css/themes.css	7 tema + dark mode
Dibuat untuk WebPOS v3.2 — Full Dynamic Permissions
