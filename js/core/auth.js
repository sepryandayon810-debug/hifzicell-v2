/**
 * AUTH — WebPOS V2
 * Username-based authentication via Firebase Auth Email/Password
 * Internal email format: username@webpos.local
 * Profile path: users/{uid}/profile
 */

const Auth = {
  _currentUser: null,

  /**
   * REGISTER
   * @param {string} username — huruf kecil, angka, underscore
   * @param {string} password
   * @param {object} profile — { name, email, role }
   */
  async register(username, password, profile = {}) {
    try {
      const cleanUser = username.toLowerCase().trim();
      const internalEmail = cleanUser + '@webpos.local';

      // 1. Cek apakah username sudah dipakai
      const methods = await auth.fetchSignInMethodsForEmail(internalEmail);
      if (methods && methods.length > 0) {
        return { success: false, error: 'Username sudah terdaftar. Silakan login atau pilih username lain.' };
      }

      // 2. Buat akun Firebase Auth
      const cred = await auth.createUserWithEmailAndPassword(internalEmail, password);
      const uid = cred.user.uid;

      // 3. Simpan profile ke RTDB
      const userProfile = {
        username: cleanUser,
        name: profile.name || cleanUser,
        email: profile.email || null,
        role: profile.role || 'kasir',
        phone: profile.phone || '',
        isActive: true,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        lastLogin: firebase.database.ServerValue.TIMESTAMP
      };

      await db.ref('users/' + uid + '/profile').set(userProfile);

      // 4. Simpan mapping username (untur referensi owner / admin)
      await db.ref('usernames/' + cleanUser).set({
        uid: uid,
        name: userProfile.name,
        role: userProfile.role,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      // 5. Log
      await db.ref('logs/' + new Date().toISOString().slice(0,10).replace(/-/g,'')).push({
        action: 'user_register',
        userId: uid,
        target: cleanUser,
        details: { role: userProfile.role },
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });

      this._currentUser = userProfile;
      return { success: true, user: userProfile };

    } catch (err) {
      console.error('Register error:', err);
      // Cleanup orphan user kalau profile gagal disimpan
      if (auth.currentUser) {
        try { await auth.currentUser.delete(); } catch(e) {}
      }
      return { success: false, error: this._mapError(err) };
    }
  },

  /**
   * LOGIN
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    try {
      const cleanUser = username.toLowerCase().trim();
      const internalEmail = cleanUser + '@webpos.local';

      const cred = await auth.signInWithEmailAndPassword(internalEmail, password);
      const uid = cred.user.uid;

      // Ambil profile
      const snap = await db.ref('users/' + uid + '/profile').once('value');
      let profile = snap.val();

      // Self-healing: kalau profile hilang (orphan), buatkan default
      if (!profile) {
        profile = {
          username: cleanUser,
          name: cleanUser,
          email: null,
          role: 'kasir',
          isActive: true,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          lastLogin: firebase.database.ServerValue.TIMESTAMP
        };
        await db.ref('users/' + uid + '/profile').set(profile);
        await db.ref('usernames/' + cleanUser).set({
          uid: uid, name: cleanUser, role: 'kasir'
        });
      }

      // Cek isActive
      if (profile.isActive === false) {
        await auth.signOut();
        return { success: false, error: 'Akun Anda dinonaktifkan. Hubungi owner.' };
      }

      // Update lastLogin
      await db.ref('users/' + uid + '/profile/lastLogin').set(firebase.database.ServerValue.TIMESTAMP);

      this._currentUser = profile;

      // Simpan ke session (optional, untuk offline awareness)
      sessionStorage.setItem('webpos_user', JSON.stringify(profile));

      return { success: true, user: profile };

    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: this._mapError(err) };
    }
  },

  /**
   * LOGOUT
   */
  async logout() {
    this._currentUser = null;
    sessionStorage.removeItem('webpos_user');
    try {
      await auth.signOut();
    } catch(e) {}
    return true;
  },

  /**
   * GET CURRENT USER
   * Cek Firebase Auth state + ambil profile dari RTDB
   */
  async getCurrentUser() {
    return new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged(async (fbUser) => {
        unsub();
        if (!fbUser) {
          this._currentUser = null;
          resolve(null);
          return;
        }
        try {
          const snap = await db.ref('users/' + fbUser.uid + '/profile').once('value');
          const profile = snap.val();
          if (profile && profile.isActive !== false) {
            this._currentUser = profile;
            resolve(profile);
          } else {
            // Profile tidak ada atau nonaktif → logout
            await this.logout();
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
  },

  /**
   * MAP ERROR FIREBASE → BAHASA INDONESIA
   */
  _mapError(err) {
    const code = err.code || err.message || '';
    const map = {
      'auth/invalid-email': 'Format username tidak valid.',
      'auth/user-disabled': 'Akun ini dinonaktifkan.',
      'auth/user-not-found': 'Username tidak ditemukan.',
      'auth/wrong-password': 'Password salah.',
      'auth/invalid-credential': 'Username atau password salah.',
      'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
      'auth/email-already-in-use': 'Username sudah terdaftar.',
      'auth/weak-password': 'Password terlalu lemah. Minimal 6 karakter.',
      'auth/network-request-failed': 'Koneksi internet bermasalah.',
      'auth/invalid-login-credentials': 'Username atau password salah.',
      'PERMISSION_DENIED': 'Gagal menyimpan data. Cek Firebase Rules.',
    };
    for (const [key, val] of Object.entries(map)) {
      if (code.includes(key)) return val;
    }
    return err.message || 'Terjadi kesalahan. Silakan coba lagi.';
  }
};

// Expose
window.Auth = Auth;
