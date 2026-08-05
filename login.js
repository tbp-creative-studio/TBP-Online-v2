import { auth, showToast } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// 👑 আপনার নির্দিষ্ট অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "Mrx2580a1@gmail.com"; 

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    showToast("Login Successful!");

    // 🧠 অ্যাডমিন হলে admin.html, অন্যথায় dashboard.html
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (err) {
    showToast(err.message, "error");
  }
});
