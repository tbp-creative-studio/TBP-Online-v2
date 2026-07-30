import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Your Firebase Config Updated Automatically!
const firebaseConfig = {
  apiKey: "AIzaSyDwT-rRCZg7OZJ7C70cXuHrdjPKVb1JqG8",
  authDomain: "tbp-online-v2.firebaseapp.com",
  projectId: "tbp-online-v2",
  storageBucket: "tbp-online-v2.firebasestorage.app",
  messagingSenderId: "574042171434",
  appId: "1:574042171434:web:a3354dbc2cfbf739d5bb53",
  measurementId: "G-79Q2H9L7LG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global Toast Notification Helper
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if(!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
