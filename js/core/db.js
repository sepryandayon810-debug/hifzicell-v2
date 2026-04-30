/**
 * DB — WebPOS V2
 * Helper CRUD Firebase Realtime Database.
 */

const DB = {
    get(path) {
        return db.ref(path).once('value').then(snap => snap.val());
    },

    set(path, data) {
        return db.ref(path).set(data);
    },

    push(path, data) {
        const ref = db.ref(path).push();
        return ref.set(data).then(() => ref.key);
    },

    update(path, data) {
        return db.ref(path).update(data);
    },

    remove(path) {
        return db.ref(path).remove();
    },

    on(path, callback, eventType = 'value') {
        db.ref(path).on(eventType, snap => callback(snap.val(), snap.key));
        return () => db.ref(path).off(eventType);
    },

    off(path, eventType = 'value') {
        db.ref(path).off(eventType);
    },

    transaction(path, updateFn) {
        return db.ref(path).transaction(updateFn);
    },

    // Query dengan limit
    query(path, options = {}) {
        let ref = db.ref(path);
        if (options.orderByChild) ref = ref.orderByChild(options.orderByChild);
        if (options.limitToLast) ref = ref.limitToLast(options.limitToLast);
        if (options.limitToFirst) ref = ref.limitToFirst(options.limitToFirst);
        if (options.equalTo !== undefined) ref = ref.equalTo(options.equalTo);
        return ref.once('value').then(snap => snap.val());
    }
};

window.DB = DB;
