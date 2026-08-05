import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      // ১. যদি ডাটাবেজে কোনো তথ্য থাকে
      const userData = userDoc.exists() ? userDoc.data() : {};

      // 👤 Avatar ( নামের ১ম অক্ষর )
      const name = userData.name || user.displayName || "User";
      if (document.getElementById('userAvatar')) {
        document.getElementById('userAvatar').innerText = name.charAt(0).toUpperCase();
      }

      // 📛 Name
      if (document.getElementById('profileName')) {
        document.getElementById('profileName').innerText = name;
      }

      // 💎 VIP Level
      if (document.getElementById('profileVip')) {
        document.getElementById('profileVip').innerText = userData.plan || "VIP 0 (Free)";
      }

      // 🆔 UID Fix: userData.userId না থাকলে user.uid দেখাবে (কখনোই undefined হবে না)
      const finalUid = userData.userId || userData.uid || user.uid;
      if (document.getElementById('profileUid')) {
        document.getElementById('profileUid').innerText = finalUid;
      }

      // 📱 Contact (Phone / Email)
      if (document.getElementById('profileContact')) {
        document.getElementById('profileContact').innerText = userData.phone || userData.email || user.email || "N/A";
      }

      // 💰 Balance Fix: .toFixed(2) দিয়ে 60.59999... কে 60.60 বানানো হয়েছে
      if (document.getElementById('profileBalance')) {
        const rawBalance = Number(userData.balance) || 0;
        document.getElementById('profileBalance').innerText = `৳${rawBalance.toFixed(2)}`;
      }

      // 📅 Joined Date
      if (document.getElementById('profileJoined')) {
        let joinedDate = "N/A";
        if (userData.createdAt) {
          joinedDate = new Date(userData.createdAt).toLocaleDateString();
        } else if (user.metadata && user.metadata.creationTime) {
          joinedDate = new Date(user.metadata.creationTime).toLocaleDateString();
        }
        document.getElementById('profileJoined').innerText = joinedDate;
      }

    } catch (err) {
      console.error("Error loading profile:", err);
    }
  } else {
    window.location.href = "login.html";
  }
});

// Logout Button Logic
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      if (typeof showToast === "function") showToast("Logged out successfully!");
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
    }
  });
}
