import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // 1. Avatar (Prothom okkhor)
        const name = userData.name || "User";
        if (document.getElementById('userAvatar')) {
          document.getElementById('userAvatar').innerText = name.charAt(0).toUpperCase();
        }

        // 2. Name
        if (document.getElementById('profileName')) {
          document.getElementById('profileName').innerText = name;
        }

        // 3. VIP Level
        if (document.getElementById('profileVip')) {
          document.getElementById('profileVip').innerText = userData.plan || "VIP 0 (Free)";
        }

        // 4. 6-digit Unique UID
        const displayUid = userData.userId || userData.uid;
        if (document.getElementById('profileUid')) {
          document.getElementById('profileUid').innerText = displayUid;
        }

        // 5. Contact (Phone ba Email)
        if (document.getElementById('profileContact')) {
          document.getElementById('profileContact').innerText = userData.phone || userData.email || "N/A";
        }

        // 6. Balance
        if (document.getElementById('profileBalance')) {
          document.getElementById('profileBalance').innerText = `৳${userData.balance || 0}`;
        }

        // 7. Joined Date
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
