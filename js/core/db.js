/**
 * DB — WebPOS V2
 * Helper CRUD Firebase RTDB
 */

const DB = {
    ref(path) { return db.ref(path); },

    async get(path) {
        const snap = await db.ref(path).once('value');
        return snap.val();
    },

    async set(path, data) {
        return db.ref(path).set(data);
    },

    async update(path, data) {
        return db.ref(path).update(data);
    },

    async push(path, data) {
        const ref = db.ref(path).push();
        await ref.set(data);
        return ref.key;
    },

    async remove(path) {
        return db.ref(path).remove();
    },

    on(path, callback) {
        return db.ref(path).on('value', snap => callback(snap.val(), snap));
    },

    off(path) {
        return db.ref(path).off();
    }
};

window.DB = DB;
