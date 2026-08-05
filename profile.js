import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      // 👤 Avatar
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

      // 🆔 6-Digit UID Logic
      let finalUid = userData.userId;

      if (!finalUid) {
        // যদি ডাটাবেজে ৬ ডিজিটের আইডি না থাকে, তবে একটি র্যান্ডম ৬ ডিজিটের নম্বর জেনারেট হবে (যেমন: 583920)
        finalUid = Math.floor(100000 + Math.random() * 900000).toString();
        
        // ফায়ারবেসেও এটা সেভ হয়ে যাবে যাতে প্রতিবার একই আইডি থাকে
        await updateDoc(userRef, { userId: finalUid }).catch(() => {});
      }

      if (document.getElementById('profileUid')) {
        document.getElementById('profileUid').innerText = finalUid;
      }

      // 📱 Contact
      if (document.getElementById('profileContact')) {
        document.getElementById('profileContact').innerText = userData.phone || userData.email || user.email || "N/A";
      }

      // 💰 Balance (দশমিক ২ ঘর)
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
