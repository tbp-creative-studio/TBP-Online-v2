import { auth, db, showToast } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 👑 অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "mrx2580a1@gmail.com"; 

// ----------------------------------------------------
// 🔗 URL থেকে রেফারাল আইডি অটো ধরা (যেমন: register.html?ref=239551)
// ----------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const refFromUrl = urlParams.get('ref');
if (refFromUrl && document.getElementById('regReferrer')) {
  document.getElementById('regReferrer').value = refFromUrl;
}

// ----------------------------------------------------
// ১. লগইন হ্যান্ডলার (Login System)
// ----------------------------------------------------
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // login.html এর ID অনুযায়ী ধরা হচ্ছে
    const emailInput = document.getElementById('loginEmail') || document.getElementById('email');
    const passwordInput = document.getElementById('loginPassword') || document.getElementById('password');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      showToast("Login Successful!");

      // 🧠 ইমেইল অ্যাডমিন হলে সরাসরি admin.html, অন্যথায় dashboard.html
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
      // 💡 ৬ ডিজিটের ইউনিক ইউজার আইডি জেনারেট (যেমন: 239551)
      const uniqueUserId = Math.floor(100000 + Math.random() * 900000).toString();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore-এ ডাটা সেভ
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        userId: uniqueUserId, // ৬ ডিজিটের ইউনিক আইডি
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
