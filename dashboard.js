import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    document.getElementById("userName").innerText = data.name;
    document.getElementById("balance").innerText = `৳${data.balance || 0}`;
    document.getElementById("totalIncome").innerText = `৳${data.totalIncome || 0}`;
    document.getElementById("todayIncome").innerText = `৳${data.todayIncome || 0}`;
    document.getElementById("referral").innerText = data.referral || 0;
    document.getElementById("deposit").innerText = `৳${data.deposit || 0}`;
    document.getElementById("withdraw").innerText = `৳${data.withdraw || 0}`;
    document.getElementById("vip").innerText = data.vip || "Free";

    // Daily Bonus Listener (১০ টাকা বোনাস)
    document.getElementById('dailyBonusBtn').addEventListener('click', async () => {
      const now = new Date().getTime();
      const lastClaim = data.lastBonusClaim ? new Date(data.lastBonusClaim).getTime() : 0;
      
      if (now - lastClaim > 86400000) { // 24 hours
        await updateDoc(doc(db, "users", user.uid), {
          balance: increment(10),
          totalIncome: increment(10),
          todayIncome: increment(10),
          lastBonusClaim: new Date().toISOString()
        });
        showToast("Claimed ৳10 Daily Bonus!");
        location.reload();
      } else {
        showToast("Already claimed today!", "error");
      }
    });
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  signOut(auth).then(() => window.location.href = "login.html");
});
