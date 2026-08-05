import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // ১. Avatar ( নামের প্রথম অক্ষর )
        const name = userData.name || "User";
        if (document.getElementById('userAvatar')) {
          document.getElementById('userAvatar').innerText = name.charAt(0).toUpperCase();
        }

        // ২. Name
        if (document.getElementById('profileName')) {
          document.getElementById('profileName').innerText = name;
        }

        // ৩. VIP Level
        if (document.getElementById('profileVip')) {
          document.getElementById('profileVip').innerText = userData.plan || "VIP 0 (Free)";
        }

        // 💡 ৪. UID (undefined সমস্যা সমাধান: userId না থাকলে ফায়ারবেসের uid দেখাবে)
        const displayUid = userData.userId || userData.uid || user.uid;
        if (document.getElementById('profileUid')) {
          document.getElementById('profileUid').innerText = displayUid;
        }

        // ৫. Contact (Phone বা Email)
        if (document.getElementById('profileContact')) {
          document.getElementById('profileContact').innerText = userData.phone || userData.email || user.email || "N/A";
        }

        // 💡 ৬. Balance (দশমিকের লম্বা সংখ্যা ফিক্স করা হয়েছে: .toFixed(2))
        if (document.getElementById('profileBalance')) {
          const balance = Number(userData.balance || 0);
          document.getElementById('profileBalance').innerText = `৳${balance.toFixed(2)}`;
        }

        // ৭. Joined Date
        if (document.getElementById('profileJoined')) {
          const joinedDate = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A";
          document.getElementById('profileJoined').innerText = joinedDate;
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  } else {
    window.location.href = "login.html";
  }
});

// Logout Listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showToast("Logged out successfully!");
      window.location.href = "login.html";
    } catch (err) {
      showToast(err.message, "error");
    }
  });
      }
