/* ============================================
   🔥 Firebase Initialization - Sherly Panty Shop
   ============================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAxKjFo90xP1aHNv7GOKX-9NdovX8MWueQ",
  authDomain: "sherly-shop-b445b.firebaseapp.com",
  databaseURL: "https://sherly-shop-b445b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sherly-shop-b445b",
  storageBucket: "sherly-shop-b445b.firebasestorage.app",
  messagingSenderId: "301161451556",
  appId: "1:301161451556:web:96b5d8ebab0a46816188b1"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
