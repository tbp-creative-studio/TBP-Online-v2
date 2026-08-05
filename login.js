import { auth, showToast } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// 👑 আপনার অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "mrx2580a1@gmail.com"; 

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      showToast("Login Successful!");

      // 🧠 ম্যাজিক লজিক: ইমেইল মিলালেই সরাসরি Admin Panel-এ পাঠাবে
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }

    } catch (err) {
      showToast(err.message, "error");
    }
  });
}
