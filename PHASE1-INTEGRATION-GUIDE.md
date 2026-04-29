🚀 PHASE 1 INTEGRATION GUIDE
Foundation Layer: Permission System + Dynamic Sidebar + Theme
📁 File Baru (4 File)
Table
#	File	Letakkan Di
1	permission-manager.js	src/js/
2	nav-config.js	src/js/
3	sidebar.css	src/css/
4	themes.css	src/css/ (sudah ada di GitHub)
🔧 STEP-BY-STEP: Edit index.html
STEP 1: Tambahkan CSS di <head>
Cari bagian <head> di index.html, tambahkan SEBELUM CSS lama:
HTML
Preview
Copy
<head>
  <!-- ⭐ BARU: Theme System -->
  <link rel="stylesheet" href="src/css/themes.css">
  <link rel="stylesheet" href="src/css/sidebar.css">

  <!-- CSS lama kamu (biarkan) -->
  <link rel="stylesheet" href="style.css">
  ...
</head>
STEP 2: Ubah Struktur Body
SEBELUM (struktur lama):
HTML
Preview
Copy
<body>
  <div class="sidebar">
    <!-- menu statis -->
    <a href="index.html">Dashboard</a>
    <a href="kasir.html">Kasir</a>
    ...
  </div>
  <div class="content">
    ...
  </div>
</body>
SESUDAH (struktur baru):
HTML
Preview
Copy
<body>
  <!-- ⭐ BARU: Mobile Toggle -->
  <button class="sidebar-toggle" id="sidebarToggle">☰</button>

  <!-- ⭐ BARU: Sidebar (kosong, diisi oleh JS) -->
  <div class="sidebar" id="sidebar">
    <!-- Sidebar akan dirender otomatis oleh nav-config.js -->
  </div>

  <!-- ⭐ BARU: Main Content Wrapper -->
  <div class="main-content">
    <!-- Konten dashboard kamu yang sudah ada -->
    <div class="content">
      ...
    </div>
  </div>
</body>
STEP 3: Tambahkan JS di Bawah (Sebelum </body>)
Tambahkan SEBELUM script lama kamu:
HTML
Preview
Copy
  <!-- ⭐ BARU: Firebase & Foundation Scripts -->
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
  <script src="src/js/firebase-config.js"></script>

  <!-- ⭐ BARU: Phase 1 Foundation -->
  <script src="src/js/settings-structure.js"></script>
  <script src="src/js/theme-manager.js"></script>
  <script src="src/js/permission-manager.js"></script>
  <script src="src/js/nav-config.js"></script>

  <!-- Script lama kamu (biarkan) -->
  <script src="src/js/utils.js"></script>
  <script src="src/js/dashboard.js"></script>
</body>
STEP 4: Hapus CSS Sidebar Lama
Di style.css atau CSS lama, HAPUS atau COMMENT semua style .sidebar lama:
css
Copy
/* HAPUS SEMUA INI: */
/*
.sidebar { background: #1a237e; ... }
.sidebar a { color: white; ... }
.sidebar .menu-item { ... }
...dll...
*/
Biarkan saja kalau tidak yakin — sidebar.css akan override yang penting.
✅ VERIFIKASI: Cek di Browser
Buka index.html, buka Console (F12):
plain
Copy
✅ Permissions loaded: owner {dashboard: true, kasir: true, ...}
✅ Theme loaded from Firebase: ocean
Kalau muncul ✅ = Phase 1 berhasil!
Kalau error ❌ = cek:
Firebase sudah di-init? (firebase-config.js di-load?)
User sudah login? (kalau belum, redirect ke login.html)
Path file benar? (src/js/... sesuai struktur folder?)
🔄 STEP SELANJUTNYA (Phase 2)
Kalau Phase 1 sudah jalan di index.html, lanjutkan ke page lain:
plain
Copy
index.html      ✅ (test ground)
kasir.html      ← Edit dengan cara yang sama
produk.html     ← Edit dengan cara yang sama
riwayat.html    ← Edit dengan cara yang sama
...dst...
Setiap page cukup:
Tambah 2 CSS (themes.css, sidebar.css)
Tambah 4 JS (settings-structure.js, theme-manager.js, permission-manager.js, nav-config.js)
Ubah <div class="sidebar"> jadi <div class="sidebar" id="sidebar">
Tambah <button class="sidebar-toggle" id="sidebarToggle">☰</button>
Bungkus konten dengan <div class="main-content">
🎨 BONUS: Tema Auto-Apply
Tema akan otomatis load dari /settings/{uid}/theme/ di Firebase.
Kalau mau test tema tanpa Firebase, tambahkan di console:
JavaScript
Copy
themeManager.applyTheme('forest', false);  // Tema forest, light mode
themeManager.applyTheme('cyber', true);      // Tema cyber, dark mode
📞 Troubleshooting
Table
Masalah	Solusi
Sidebar kosong (tidak ada menu)	Cek console, permissions belum load. Pastikan user sudah login.
Tema tidak berubah	Cek themes.css sudah di-load? Cek console error.
Mobile toggle tidak muncul	Pastikan sidebar-toggle ID benar.
Menu dropdown tidak buka	Cek nav-config.js sudah di-load setelah permission-manager.js.
CSS bentrok (warna aneh)	Hapus CSS sidebar lama di style.css.
Phase 1: Foundation Layer — WebPOS v3.2
