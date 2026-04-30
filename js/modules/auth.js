/**
 * ===================================================================
 * FILE    : js/modules/auth.js
 * FUNGSI  : Autentikasi menggunakan USERNAME (bukan email asli)
 * ALUR    :
 *   REGISTER:
 *     1. Input: username, password, nama_lengkap, role
 *     2. Cek username sudah ada? → /usernames/{username}
 *     3. Buat email palsu: username@webpos.local
 *     4. Firebase Auth createUserWithEmailAndPassword(emailPalsu, password)
 *     5. Simpan data user ke /users/{uid} → username, role, nama, menu_access
 *     6. Simpan mapping /usernames/{username} → uid
 *   LOGIN:
 *     1. Input: username, password
 *     2. Cari UID dari /usernames/{username}
 *     3. Dapatkan email palsu dari /users/{uid}/email
 *     4. Firebase Auth signInWithEmailAndPassword(email, password)
 *     5. Simpan session ke localStorage
 *   LOGOUT:
 *     1. Firebase Auth signOut()
 *     2. Hapus localStorage session
 *   CEK ROLE:
 *     1. Ambil /users/{uid}/role
 *     2. Return: "developer" | "owner" | "admin" | "kasir"
 * PENYIMPANAN: /users/{uid} dan /usernames/{username}
 * DEPENDENSI: firebase-config.js (harus diload dulu di HTML)
 * ===================================================================
 */

const AUTH = {

  /**
   * register(username, password, namaLengkap, role)
   * Fungsi  : Daftar user baru
   * Simpan  : /users/{uid} + /usernames/{username}
   * Return  : Promise { success: true/false, message: "..." }
   */
  register: async function(username, password, namaLengkap, role = "kasir") {
    try {
      // 1. Validasi input
      if (!username || !password || !namaLengkap) {
        return { success: false, message: "Username, password, dan nama lengkap wajib diisi!" };
      }
      if (password.length < 6) {
        return { success: false, message: "Password minimal 6 karakter!" };
      }

      // 2. Cek username sudah dipakai?
      const exist = await DB_USERS.isUsernameExist(username);
      if (exist) {
        return { success: false, message: "Username sudah terdaftar, gunakan username lain!" };
      }

      // 3. Buat email palsu (Firebase Auth butuh email, tapi user tidak perlu tahu)
      const fakeEmail = `${username}@webpos.local`;

      // 4. Buat akun di Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(fakeEmail, password);
      const uid = userCredential.user.uid;

      // 5. Simpan data user ke Realtime Database
      const userData = {
        username: username,
        email: fakeEmail,         // Simpan agar bisa login nanti
        nama_lengkap: namaLengkap,
        role: role,               // "developer" | "owner" | "admin" | "kasir"
        menu_access: [],          // Nanti diatur di page-pengguna.html
        createdAt: nowTimestamp(),
        isActive: true
      };
      await DB_USERS.create(uid, userData);

      // 6. Simpan mapping username → uid
      await DB_USERS.setUsername(username, uid);

      // 7. Log aktivitas
      logAktivitas(uid, "REGISTER", `User ${username} (${role}) berhasil didaftarkan`);

      return { success: true, message: "Registrasi berhasil! Silakan login." };

    } catch (error) {
      console.error("[AUTH] Register error:", error);
      let msg = error.message;
      if (msg.includes("email")) msg = "Format tidak valid atau email sudah terpakai.";
      return { success: false, message: msg };
    }
  },

  /**
   * login(username, password)
   * Fungsi  : Masuk dengan username + password
   * Ambil   : /usernames/{username} → uid → /users/{uid}/email
   * Simpan  : localStorage (session)
   * Return  : Promise { success: true/false, user: {...} | null, message: "..." }
   */
  login: async function(username, password) {
    try {
      if (!username || !password) {
        return { success: false, user: null, message: "Username dan password wajib diisi!" };
      }

      // 1. Cari UID dari username
      const mapping = await DB_USERS.getUidByUsername(username);
      if (!mapping || !mapping.uid) {
        return { success: false, user: null, message: "Username tidak ditemukan!" };
      }
      const uid = mapping.uid;

      // 2. Ambil data user (termasuk email palsu)
      const userData = await DB_USERS.getByUid(uid);
      if (!userData) {
        return { success: false, user: null, message: "Data user tidak ditemukan di database!" };
      }

      // 3. Login ke Firebase Auth pakai email palsu
      const userCredential = await auth.signInWithEmailAndPassword(userData.email, password);
      const authUser = userCredential.user;

      // 4. Simpan session ke localStorage
      const session = {
        uid: authUser.uid,
        username: userData.username,
        nama_lengkap: userData.nama_lengkap,
        role: userData.role,
        menu_access: userData.menu_access || [],
        loginAt: nowTimestamp()
      };
      localStorage.setItem("webpos_session_v3", JSON.stringify(session));

      // 5. Log aktivitas
      logAktivitas(authUser.uid, "LOGIN", `User ${userData.username} login dari ${navigator.userAgent}`);

      return { success: true, user: session, message: "Login berhasil!" };

    } catch (error) {
      console.error("[AUTH] Login error:", error);
      let msg = "Login gagal! Periksa username dan password.";
      if (error.code === "auth/wrong-password") msg = "Password salah!";
      if (error.code === "auth/user-not-found") msg = "User tidak ditemukan!";
      if (error.code === "auth/too-many-requests") msg = "Terlalu banyak percobaan, coba lagi nanti.";
      return { success: false, user: null, message: msg };
    }
  },

  /**
   * logout()
   * Fungsi  : Keluar & hapus session
   */
  logout: async function() {
    try {
      const session = AUTH.getSession();
      if (session) {
        logAktivitas(session.uid, "LOGOUT", `User ${session.username} logout`);
      }
      await auth.signOut();
      localStorage.removeItem("webpos_session_v3");
      return { success: true, message: "Logout berhasil!" };
    } catch (error) {
      console.error("[AUTH] Logout error:", error);
      localStorage.removeItem("webpos_session_v3");
      return { success: false, message: error.message };
    }
  },

  /**
   * getSession()
   * Fungsi  : Ambil data login dari localStorage
   * Return  : Object session atau null
   */
  getSession: function() {
    try {
      const data = localStorage.getItem("webpos_session_v3");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * isLoggedIn()
   * Fungsi  : Cek apakah user sudah login
   */
  isLoggedIn: function() {
    return AUTH.getSession() !== null;
  },

  /**
   * getRole()
   * Fungsi  : Ambil role user yang login
   * Return  : "developer" | "owner" | "admin" | "kasir" | null
   */
  getRole: function() {
    const session = AUTH.getSession();
    return session ? session.role : null;
  },

  /**
   * hasAccess(menuName)
   * Fungsi  : Cek apakah user punya akses ke menu tertentu
   * Logika  : Kalau menu_access kosong = bisa semua (default)
   *           Kalau ada isinya = cek apakah menuName ada di array
   */
  hasAccess: function(menuName) {
    const session = AUTH.getSession();
    if (!session) return false;
    if (!session.menu_access || session.menu_access.length === 0) return true; // Default all access
    return session.menu_access.includes(menuName);
  },

  /**
   * requireAuth()
   * Fungsi  : Paksa redirect ke login kalau belum login
   * Pakai   : Di awal setiap page (kecuali login & register)
   */
  requireAuth: function() {
    if (!AUTH.isLoggedIn()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  },

  /**
   * initAuthListener()
   * Fungsi  : Pantau perubahan status login Firebase
   *           Kalau Firebase logout (token expired), hapus localStorage juga
   */
  initAuthListener: function() {
    auth.onAuthStateChanged(user => {
      if (!user) {
        // Firebase bilang belum login → hapus localStorage
        localStorage.removeItem("webpos_session_v3");
      }
    });
  }
};

// Auto-init listener saat file ini diload
AUTH.initAuthListener();

// Export global
window.AUTH = AUTH;
