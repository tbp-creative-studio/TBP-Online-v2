import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// আপনার দেওয়া অল VIP প্যাকেজ ডাটা
const VIP_PLANS = [
  { id: "free", name: "🆓 FREE PLAN", price: 0, validity: 20, dailyTasks: 10, taskReward: 0.80, dailyBonus: 2, totalDaily: 10 },
  { id: "vip8", name: "💎 VIP 8", price: 200, validity: 30, dailyTasks: 15, taskReward: 0.90, dailyBonus: 3, totalDaily: 16.50 },
  { id: "vip7", name: "💎 VIP 7", price: 300, validity: 35, dailyTasks: 20, taskReward: 1.00, dailyBonus: 4, totalDaily: 24.00 },
  { id: "vip6", name: "💎 VIP 6", price: 400, validity: 40, dailyTasks: 25, taskReward: 1.10, dailyBonus: 5, totalDaily: 32.50 },
  { id: "vip5", name: "💎 VIP 5", price: 500, validity: 45, dailyTasks: 30, taskReward: 1.20, dailyBonus: 6, totalDaily: 42.00 },
  { id: "vip4", name: "💎 VIP 4", price: 600, validity: 50, dailyTasks: 40, taskReward: 1.30, dailyBonus: 8, totalDaily: 60.00 },
  { id: "vip3", name: "💎 VIP 3", price: 700, validity: 55, dailyTasks: 50, taskReward: 1.40, dailyBonus: 10, totalDaily: 80.00 },
  { id: "vip2", name: "💎 VIP 2", price: 800, validity: 60, dailyTasks: 75, taskReward: 1.50, dailyBonus: 12, totalDaily: 124.50 },
  { id: "vip1", name: "💎 VIP 1", price: 900, validity: 65, dailyTasks: 100, taskReward: 1.60, dailyBonus: 15, totalDaily: 175.00 }
];

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    renderPlans();
  } else {
    window.location.href = "login.html";
  }
});

function renderPlans() {
  const container = document.getElementById('plansContainer');
  if (!container) return;

  container.innerHTML = "";

  VIP_PLANS.forEach(plan => {
    const card = document.createElement('div');
    card.className = "plan-card";
    card.innerHTML = `
      <h3 style="color: #fff;">${plan.name}</h3>
      <div class="plan-price">${plan.price === 0 ? "FREE" : "৳" + plan.price}</div>
      <ul class="plan-features">
        <li>⏳ মেয়াদ: <b>${plan.validity} দিন</b></li>
        <li>✅ প্রতিদিন কাজ: <b>${plan.dailyTasks}টি</b></li>
        <li>💵 প্রতি কাজ: <b>৳${plan.taskReward.toFixed(2)}</b></li>
        <li>🎁 Daily Bonus: <b>৳${plan.dailyBonus}</b></li>
        <li>📈 মোট দৈনিক আয়: <b>৳${plan.totalDaily}</b></li>
      </ul>
      <button class="btn" style="width: 100%; margin-top: 10px;" id="buy-btn-${plan.id}">
        ${plan.price === 0 ? "Default Active" : "Buy Plan"}
      </button>
    `;
    container.appendChild(card);

    if (plan.price > 0) {
      document.getElementById(`buy-btn-${plan.id}`).addEventListener('click', () => buyPlan(plan));
    } else {
      document.getElementById(`buy-btn-${plan.id}`).disabled = true;
    }
  });
}

// প্ল্যান কেনার লজিক
async function buyPlan(plan) {
  if (!currentUser) return;

  try {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if ((userData.balance || 0) < plan.price) {
      showToast("Insufficient balance! Please deposit first.", "error");
      return;
    }

    if (confirm(`Are you sure you want to purchase ${plan.name} for ৳${plan.price}?`)) {
      // মেয়াদ হিসাব করা (আজকের তারিখ + প্ল্যানের দিন)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.validity);

      await updateDoc(userRef, {
        balance: increment(-plan.price),
        plan: plan.name,
        planId: plan.id,
        planExpiry: expiryDate.toISOString(),
        dailyTasksLimit: plan.dailyTasks,
        taskReward: plan.taskReward,
        dailyBonusAmount: plan.dailyBonus
      });

      showToast(`Successfully purchased ${plan.name}!`);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    }

  } catch (err) {
    showToast(err.message, "error");
  }
}

