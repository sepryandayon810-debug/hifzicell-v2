# 📘 WEBPOS V3 — STRUKTUR LENGKAP & PETA PENYIMPANAN

## 📁 Struktur Folder File

```
webpos-v3/
├── js/
│   ├── core/
│   │   ├── firebase-config.js      ← Konfigurasi Firebase (jangan di-commit ke public repo)
│   │   └── utils.js                ← Fungsi utility global (format rupiah, tanggal, toast, loader)
│   ├── modules/
│   │   ├── auth.js                 ← Login, register, logout, cek role
│   │   ├── db-offline.js           ← Cache offline, sync saat online
│   │   ├── nav-config.js           ← Konfigurasi sidebar menu per role
│   │   ├── sidebar-filter.js       ← Filter tampilan menu sidebar
│   │   └── theme-loader.js         ← Load tema dari /pengaturan/tema/
│   └── pages/
│       ├── kasir.js                ← Fungsi kasir (grid, keranjang, transaksi)
│       ├── produk.js               ← CRUD produk
│       ├── transaksi-kas.js        ← Kas masuk, keluar, tarik, topup, shift
│       ├── pembelian.js            ← Pembelian barang
│       ├── hutang.js               ← Hutang piutang
│       ├── pelanggan.js            ← Data pelanggan
│       ├── laporan.js              ← Laporan penjualan, laba, stok
│       ├── pengguna.js             ← Manajemen user & hak akses menu
│       ├── setting.js              ← Tema, printer, header struk
│       └── dashboard.js            ← Widget dashboard (ambil data transaksi)
├── css/
│   ├── base.css                    ← CSS dasar (layout, sidebar, responsive)
│   └── themes/
│       └── themes.css              ← 10 tema modern (var CSS)
├── index.html                      ← Dashboard utama
├── login.html                      ← Halaman login (username, bukan email)
├── register.html                   ← Halaman registrasi
├── page-*.html                     ← 25 halaman modul (sama dengan gambar)
├── manifest.json                   ← PWA manifest
└── sw.js                           ← Service Worker
```

---

## 🔥 STRUKTUR FIREBASE REALTIME DATABASE

```json
{
  "webpos-v3": {
    "users": {
      "{uid}": {
        "username": "kasir1",
        "nama_lengkap": "Budi Santoso",
        "role": "kasir",
        "permissions": {
          "kasir": true,
          "produk": false,
          "pembelian": false,
          "riwayat": true,
          "laporan": false,
          "kas": true,
          "hutang": false,
          "pelanggan": true,
          "pengguna": false,
          "setting": false,
          "backup": false,
          "log": false
        },
        "created_at": 1714473600,
        "last_login": 1714473600,
        "is_active": true
      }
    },
    "produk": {
      "{id_produk}": {
        "kode": "BRG001",
        "nama": "Indomie Goreng",
        "kategori": "Makanan",
        "harga_beli": 2500,
        "harga_jual": 3500,
        "stok": 100,
        "stok_min": 10,
        "unlimited": false,
        "satuan": "pcs",
        "created_by": "uid_admin",
        "created_at": 1714473600
      }
    },
    "transaksi": {
      "{id_transaksi}": {
        "no_invoice": "INV-20260430-0001",
        "tanggal": "2026-04-30",
        "timestamp": 1714473600,
        "kasir_uid": "uid_kasir",
        "kasir_nama": "Budi",
        "pelanggan_id": "uid_pelanggan",
        "pelanggan_nama": "Andi",
        "items": [
          {
            "produk_id": "id_produk",
            "nama": "Indomie Goreng",
            "harga_jual": 3500,
            "qty": 2,
            "subtotal": 7000
          }
        ],
        "subtotal": 7000,
        "diskon": 0,
        "total": 7000,
        "bayar": 10000,
        "kembalian": 3000,
        "metode_bayar": "tunai",
        "status": "lunas",
        "shift_id": "shift_001"
      }
    },
    "transaksi_kas": {
      "{id}": {
        "jenis": "masuk | keluar | tarik | topup | shift_masuk | shift_keluar",
        "tanggal": "2026-04-30",
        "timestamp": 1714473600,
        "jumlah": 50000,
        "keterangan": "Penjualan tunai",
        "kasir_uid": "uid_kasir",
        "kasir_nama": "Budi",
        "shift_id": "shift_001",
        "saldo_akhir": 150000
      }
    },
    "pembelian": {
      "{id}": {
        "no_nota": "PO-20260430-0001",
        "tanggal": "2026-04-30",
        "supplier": "PT Sumber Jaya",
        "items": [
          {
            "produk_id": "id_produk",
            "nama": "Indomie Goreng",
            "harga_beli": 2500,
            "qty": 50,
            "subtotal": 125000
          }
        ],
        "total": 125000,
        "status": "lunas | hutang",
        "created_by": "uid_admin"
      }
    },
    "hutang": {
      "{id}": {
        "pelanggan_id": "uid_pelanggan",
        "pelanggan_nama": "Andi",
        "jumlah": 50000,
        "sudah_bayar": 20000,
        "sisa": 30000,
        "status": "belum_lunas | lunas",
        "tanggal_hutang": "2026-04-30",
        "tanggal_jatuh_tempo": "2026-05-30",
        "riwayat_bayar": [
          {
            "tanggal": "2026-04-30",
            "jumlah": 20000,
            "kasir_uid": "uid_kasir"
          }
        ]
      }
    },
    "pelanggan": {
      "{id}": {
        "nama": "Andi Wijaya",
        "no_hp": "08123456789",
        "alamat": "Jl. Mawar No. 1",
        "total_hutang": 30000,
        "total_belanja": 150000,
        "created_at": 1714473600
      }
    },
    "pengaturan": {
      "tema": {
        "aktif": "ocean-blue",
        "tersedia": ["mint-fresh", "ocean-blue", "sunset", "dark-pro", "purple-dream", "coral", "forest", "midnight", "cherry", "golden"]
      },
      "header_struk": {
        "nama_toko": "Toko Saya",
        "alamat": "Jl. Raya No. 1",
        "no_wa": "08123456789",
        "footer": "Terima kasih telah berbelanja"
      },
      "printer": {
        "uuid": "",
        "format_kertas": "58mm",
        "auto_print": false
      },
      "aplikasi": {
        "versi": "3.0.0",
        "nama_aplikasi": "WebPOS V3",
        "require_auth": true
      }
    },
    "log_aktivitas": {
      "{id}": {
        "uid": "uid_kasir",
        "nama": "Budi",
        "aksi": "login | transaksi | edit_produk | hapus_data",
        "detail": "Membuat transaksi INV-001",
        "timestamp": 1714473600,
        "ip_address": "192.168.1.1"
      }
    }
  }
}
```

---

## 🗺️ PETA PENYIMPANAN & KETERHUBUNGAN

| Page | Fungsi Utama | Menyimpan Ke | Mengambil Dari | Keterhubungan |
|------|-------------|--------------|----------------|---------------|
| **page-kasir.html** | Input penjualan | `/transaksi/` | `/produk/` (list & stok) | Stok berkurang otomatis |
| **page-produk.html** | Kelola barang | `/produk/` | `/produk/` | Update stok juga update data di kasir |
| **page-kas-masuk.html** | Kas masuk | `/transaksi_kas/` | `/transaksi_kas/` | Saldo bertambah |
| **page-kas-keluar.html** | Kas keluar | `/transaksi_kas/` | `/transaksi_kas/` | Saldo berkurang |
| **page-kas-tarik.html** | Tarik tunai | `/transaksi_kas/` | `/transaksi_kas/` | Saldo berkurang |
| **page-kas-topup.html** | Topup saldo | `/transaksi_kas/` | `/transaksi_kas/` | Saldo bertambah |
| **page-kas-shift.html** | Shift kasir | `/transaksi_kas/` | `/transaksi_kas/` | Catatan shift masuk/keluar |
| **page-pembelian.html** | Beli barang | `/pembelian/` + `/produk/` (stok+) | `/produk/` | Stok produk bertambah |
| **page-hutang.html** | Hutang/piutang | `/hutang/` | `/pelanggan/` | Cek pelanggan sebelum input hutang |
| **page-data-pelanggan.html** | Master pelanggan | `/pelanggan/` | `/pelanggan/` | Dipakai hutang & kasir |
| **page-riwayat.html** | Riwayat transaksi | - | `/transaksi/` | Read-only dari transaksi |
| **page-laporan.html** | Laporan umum | - | `/transaksi/` + `/transaksi_kas/` | Gabung data transaksi & kas |
| **page-laporan-owner.html** | Laporan keuangan owner | - | `/transaksi/` + `/transaksi_kas/` + `/pembelian/` | Laba = jual - beli - operasional |
| **page-laporan-stok.html** | Laporan stok | - | `/produk/` | Cek stok menipis |
| **page-laporan-tarik.html** | Laporan tarik tunai | - | `/transaksi_kas/` | Filter jenis=tarik |
| **page-modal.html** | Modal usaha | `/transaksi_kas/` (jenis=modal) | `/transaksi_kas/` | Modal masuk ke kas |
| **page-modal-harian.html** | Modal harian | `/transaksi_kas/` | `/transaksi_kas/` | Shift-based |
| **page-pengguna.html** | Kelola user | `/users/` | `/users/` | Atur permissions |
| **page-setting.html** | Pengaturan | `/pengaturan/` | `/pengaturan/` | Tema, printer, header struk |
| **page-printer.html** | Setting printer | `/pengaturan/printer/` | `/pengaturan/printer/` | UUID & format |
| **page-backup.html** | Backup data | - | Semua node | Export JSON/CSV |
| **page-reset.html** | Reset data | - | Semua node | Hapus data per node |
| **page-log-aktivitas.html** | Log akses | `/log_aktivitas/` | `/log_aktivitas/` | Tracking user |
| **page-saldo-telegram.html** | Notifikasi saldo | - | `/transaksi_kas/` | Kirim notif ke Telegram |
| **page-closing.html** | Tutup shift | `/transaksi_kas/` | `/transaksi/` + `/transaksi_kas/` | Hitung closing shift |
| **index.html** | Dashboard | - | `/transaksi/` + `/transaksi_kas/` + `/produk/` | Ringkasan semua data |

---

## 🛡️ FIREBASE RULES — FLEKSIBEL & MASA DEPAN

Rules menggunakan **role-based** dari database, bukan hardcoded.
Jadi kalau nanti tambah role baru seperti "supervisor" atau "gudang",
**tidak perlu ubah rules Firebase** — cukup tambah di data users.

```json
{
  "rules": {
    "webpos-v3": {
      "users": {
        "$uid": {
          ".read": "auth != null && (auth.uid == $uid || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')",
          ".write": "auth != null && (auth.uid == $uid || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')"
        }
      },
      "produk": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'admin' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')"
      },
      "transaksi": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "transaksi_kas": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'admin' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'kasir' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')"
      },
      "pembelian": {
        ".read": "auth != null && (root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'admin' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')",
        ".write": "auth != null && (root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'admin' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')"
      },
      "hutang": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "pelanggan": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "pengaturan": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')"
      },
      "log_aktivitas": {
        ".read": "auth != null && (root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'owner' || root.child('webpos-v3/users').child(auth.uid).child('role').val() == 'developer')",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 🎨 10 TEMA YANG DIBUAT

1. **Mint Fresh** — Hijau toska + putih (clean, segar)
2. **Ocean Blue** — Biru gradasi + putih (profesional, tenang)
3. **Sunset** — Oranye lembut + krem (hangat, ramah)
4. **Dark Pro** — Hitam abu-abu + emas (elegan, malam)
5. **Purple Dream** — Ungu lavender + putih (modern, kreatif)
6. **Coral Reef** — Pink coral + putih (ceria, feminine)
7. **Forest** — Hijau hutan + krem (natural, earthy)
8. **Midnight** — Navy gelap + emas (premium, mewah)
9. **Cherry** — Pink sakura + putih (soft, manis)
10. **Golden** — Kuning emas + putih (luxury, energik)

---

## ⚡ CARA MENAMBAH PAGE BARU (Tanpa Bingung)

Kalau mau buat page baru, ikuti template ini:

**1. Tentukan modulnya:**
   - Jualan → `/transaksi/`
   - Barang → `/produk/`
   - Uang kas → `/transaksi_kas/`
   - Beli barang → `/pembelian/`
   - Hutang → `/hutang/`
   - Pelanggan → `/pelanggan/`
   - Setting → `/pengaturan/`

**2. Buat file HTML:** `page-[nama].html`

**3. Buat file JS:** `js/pages/[nama].js`

**4. Di JS, pastikan ada komentar header:**
```javascript
/**
 * FILE: js/pages/[nama].js
 * PAGE: page-[nama].html
 * FUNGSI: [Jelaskan apa yang dilakukan]
 * SIMPAN KE: /webpos-v3/[node]/
 * AMBIL DARI: /webpos-v3/[node]/
 * DEPENDENSI: firebase-config.js, utils.js
 */
```

**5. Tambahkan ke nav-config.js** agar muncul di sidebar.
