import { auth, db, showToast } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 👑 আপনার নির্দিষ্ট অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "Teamtbpessports@gmail.com"; 

// ----------------------------------------------------
// ১. লগইন হ্যান্ডলার (Login System)
// ----------------------------------------------------
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      showToast("Login Successful!");

      // 🧠 স্মার্ট রিডাইরেক্ট: ইমেইল মিলালেই অ্যাডমিন প্যানেলে পাঠাবে
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }

    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

// ----------------------------------------------------
// ২. রেজিস্ট্রেশন হ্যান্ডলার (Registration System)
// ----------------------------------------------------
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const referrer = document.getElementById('regReferrer')?.value.trim() || "";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore-এ ইউজারের ডাটা সেভ
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        balance: 0,
        totalIncome: 0,
        todayIncome: 0,
        deposit: 0,
        withdraw: 0,
        referredBy: referrer,
        createdAt: new Date().toISOString()
      });

      showToast("Registration Successful!");

      // রেজিস্ট্রেশন করার পর অটোমেটিক রিডাইরেক্ট
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }

    } catch (error) {
      showToast(error.message, "error");
    }
  });
}
