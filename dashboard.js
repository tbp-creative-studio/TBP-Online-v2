import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();

      // ১. নাম বসানো
      if (document.getElementById("userName")) document.getElementById("userName").innerText = data.name || "User";
      
      // 💰 ২. ব্যালেন্স ও ইনকাম ফিক্সড দশমিক ২ ঘর (.toFixed(2))
      if (document.getElementById("balance")) document.getElementById("balance").innerText = `৳${(Number(data.balance) || 0).toFixed(2)}`;
      if (document.getElementById("totalIncome")) document.getElementById("totalIncome").innerText = `৳${(Number(data.totalIncome) || 0).toFixed(2)}`;
      if (document.getElementById("todayIncome")) document.getElementById("todayIncome").innerText = `৳${(Number(data.todayIncome) || 0).toFixed(2)}`;
      if (document.getElementById("deposit")) document.getElementById("deposit").innerText = `৳${(Number(data.deposit) || 0).toFixed(2)}`;
      if (document.getElementById("withdraw")) document.getElementById("withdraw").innerText = `৳${(Number(data.withdraw) || 0).toFixed(2)}`;
      
      // 🆔 ৩. UID undefined ফিক্স: custom userId -> data.uid -> user.uid
      const finalUid = data.userId || data.uid || user.uid;
      if (document.getElementById("userUid")) document.getElementById("userUid").innerText = finalUid;
      if (document.getElementById("vip")) document.getElementById("vip").innerText = data.plan || "FREE PLAN";

      // 🔗 ৪. রেফারাল লিঙ্ক ও কাউন্ট
      if (document.getElementById("referral")) document.getElementById("referral").innerText = data.referralCount || 0;
      
      const refInput = document.getElementById("referralLink");
      if (refInput) {
        refInput.value = `${window.location.origin}/register.html?ref=${finalUid}`;
      }

      // 🎁 ৫. প্ল্যান অনুযায়ী ডাইনামিক ডেইলি বোনাস লজিক
      const bonusBtn = document.getElementById('dailyBonusBtn') || document.getElementById('claimBonusBtn');
      if (bonusBtn) {
        bonusBtn.addEventListener('click', async () => {
          const now = Date.now();
          const lastClaim = data.lastBonusClaim ? new Date(data.lastBonusClaim).getTime() : 0;
          const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

          if (now - lastClaim >= TWENTY_FOUR_HOURS) {
            // ইউজারের বর্তমান প্ল্যান অনুযায়ী বোনাস নির্ধারণ (ডিফল্ট ফ্রি প্ল্যান = ৳২)
            const bonusAmount = Number(data.dailyBonusAmount) || 2;

            await updateDoc(doc(db, "users", user.uid), {
              balance: increment(bonusAmount),
              totalIncome: increment(bonusAmount),
              todayIncome: increment(bonusAmount),
              lastBonusClaim: new Date().toISOString()
            });

            showToast(`Claimed ৳${bonusAmount} Daily Bonus!`);
            setTimeout(() => location.reload(), 1000);
          } else {
            showToast("Already claimed today! Try again after 24 hours.", "error");
          }
        });
      }
    }
  } catch (err) {
    console.error("Dashboard error:", err);
  }
});

// 🚪 ৬. লগআউট সিস্টেম
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
      showToast("Logged out successfully!");
      window.location.href = "login.html";
    });
  });
}
