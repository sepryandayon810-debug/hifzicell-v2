/**
 * FIREBASE CONFIG — WebPOS V2
 * Ganti placeholder __XXX__ dengan data project Firebase baru kamu.
 * File ini HANYA config, tidak ada logic bisnis.
 */

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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

window.firebaseApp = { auth, db };
