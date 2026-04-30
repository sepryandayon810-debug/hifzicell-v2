/**
 * AUTH — WebPOS V2
 * Login, register, role check, session guard.
 * Role: developer | owner | admin | kasir
 */

const Auth = {
    _currentUser: null,
    _userProfile: null,

    async init() {
        return new Promise((resolve) => {
            WebPOS.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this._currentUser = user;
                    // Load profile dari /users/{uid}/profile
                    const snap = await db.ref(`users/${user.uid}/profile`).once('value');
                    this._userProfile = snap.val() || { role: 'kasir', name: user.email };
                } else {
                    this._currentUser = null;
                    this._userProfile = null;
                }
                resolve(this._currentUser);
            });
        });
    },

    async login(email, password) {
        try {
            const cred = await WebPOS.auth.signInWithEmailAndPassword(email, password);
            // Update last login
            await db.ref(`users/${cred.user.uid}/meta/lastLogin`).set(Date.now());
            return { success: true, user: cred.user };
        } catch (err) {
            return { success: false, error: this._parseError(err) };
        }
    },

    async register(email, password, profile = {}) {
        try {
            const cred = await WebPOS.auth.createUserWithEmailAndPassword(email, password);
            const uid = cred.user.uid;
            const defaultProfile = {
                name: profile.name || email.split('@')[0],
                email: email,
                role: profile.role || 'kasir',
                phone: profile.phone || '',
                isActive: true,
                createdAt: Date.now()
            };
            await db.ref(`users/${uid}/profile`).set(defaultProfile);
            await db.ref(`users/${uid}/meta/lastLogin`).set(Date.now());
            return { success: true, uid };
        } catch (err) {
            return { success: false, error: this._parseError(err) };
        }
    },

    async logout() {
        await WebPOS.auth.signOut();
        this._currentUser = null;
        this._userProfile = null;
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        return this._currentUser;
    },

    getUserProfile() {
        return this._userProfile;
    },

    getUserRole() {
        return this._userProfile?.role || 'kasir';
    },

    isRole(roles) {
        const r = this.getUserRole();
        if (Array.isArray(roles)) return roles.includes(r);
        return r === roles;
    },

    requireAuth() {
        if (!this._currentUser) {
            window.location.href = 'index.html?mode=login';
            return false;
        }
        return true;
    },

    requireRole(roles) {
        if (!this.requireAuth()) return false;
        if (!this.isRole(roles)) {
            Utils.toast('Akses ditolak: role tidak memenuhi syarat', 'error');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return false;
        }
        return true;
    },

    _parseError(err) {
        const map = {
            'auth/invalid-email': 'Email tidak valid',
            'auth/user-disabled': 'Akun dinonaktifkan',
            'auth/user-not-found': 'Email tidak terdaftar',
            'auth/wrong-password': 'Password salah',
            'auth/email-already-in-use': 'Email sudah terdaftar',
            'auth/weak-password': 'Password minimal 6 karakter',
            'auth/invalid-credential': 'Email atau password salah'
        };
        return map[err.code] || err.message || 'Terjadi kesalahan';
    }
};

window.Auth = Auth;
