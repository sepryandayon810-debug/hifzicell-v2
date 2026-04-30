/**
 * FIREBASE CONFIG — WebPOS V2
 * Ganti placeholder __XXX__ dengan data project Firebase baru kamu.
 * File ini HANYA config, tidak ada logic bisnis.
 */

const firebaseConfig = {
    apiKey: "__API_KEY__",
    authDomain: "__PROJECT_ID__.firebaseapp.com",
    databaseURL: "https://__PROJECT_ID__-default-rtdb.firebaseio.com",
    projectId: "__PROJECT_ID__",
    storageBucket: "__PROJECT_ID__.appspot.com",
    messagingSenderId: "__SENDER_ID__",
    appId: "__APP_ID__"
};

// Initialize Firebase (hanya sekali)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// Global export untuk non-module script
window.WebPOS = { auth, db };
