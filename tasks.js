import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc, increment, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 👑 প্ল্যান অনুযায়ী দৈনিক সর্বোচ্চ টাস্ক সীমা (Task Limits)
const PLAN_LIMITS = {
  "Free Plan": 10,
  "VIP 1": 15,
  "VIP 2": 20,
  "VIP 3": 30
};

// 🚀 ২০টি কাজের বিশাল তালিকা (আপনি চাইলে আরও বাড়াতে পারেন)
const ALL_TASKS = [
  { id: 1, title: "1️⃣ Subscribe TBP Creative Studio", link: "https://youtube.com/@mentalversion?si=AphAqBLbN4NND3Hc", reward: 0.80, type: "auto", instructions: "ইউটিউব চ্যানেলটি সাবস্ক্রাইব করুন এবং ১৫ সেকেন্ড অপেক্ষা করুন।" },
  { id: 2, title: "2️⃣ Join Official Telegram Channel", link: "https://t.me/+jZc6SmG7UgM5ZGZl", reward: 0.80, type: "auto", instructions: "টেলিগ্রাম চ্যানেলে জয়েন করুন এবং ১৫ সেকেন্ড অপেক্ষা করুন।" },
  { id: 3, title: "3️⃣ Follow Facebook Page", link: "https://www.facebook.com/share/19AP6gYCmG/", reward: 0.80, type: "auto", instructions: "ফেসবুক পেজটি ফলো করুন এবং ১৫ সেকেন্ড অপেক্ষা করুন।" },
  { id: 4, title: "4️⃣ Complete Special CPAGrip Offer (App/Email)", link: "https://singingfiles.com/show.php?l=0&u=2547705&id=54741", reward: 0.80, type: "manual", instructions: "⚠️ লিঙ্কে ক্লিক করে অ্যাপ ডাউনলোড/ইমেইল সাবমিট করুন। কাজ শেষ হলে স্ক্রিনশট ও ইউজারনেম জমা দিন।" },
  { id: 5, title: "5️⃣ Watch Advertisement 1 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 6, title: "6️⃣ Watch YouTube Video (1 min)", link: "https://youtu.be/GXOqWAmFr24?si=PSEpIGjZ8jU2yv2o", reward: 0.80, type: "auto", instructions: "ভিডিওটি মনোযোগ দিয়ে দেখুন।" },
  { id: 7, title: "7️⃣ Watch Advertisement 2 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 8, title: "8️⃣ Watch Advertisement 3 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 9, title: "9️⃣ Watch Advertisement 4 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 10, title: "🔟 Watch Advertisement 5 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  
  // ➕ অতিরিক্ত আরও ১০টি নতুন টাস্ক
  { id: 11, title: "1️⃣1️⃣ Visit Official Website", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "ওয়েবসাইটটি ভিজিট করে ৩০ সেকেন্ড অপেক্ষা করুন।" },
  { id: 12, title: "1️⃣2️⃣ Watch Special Video 2", link: "https://youtu.be/GXOqWAmFr24?si=PSEpIGjZ8jU2yv2o", reward: 0.80, type: "auto", instructions: "ভিডিওটি মনোযোগ দিয়ে দেখুন।" },
  { id: 13, title: "1️⃣3️⃣ Watch Advertisement 6 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 14, title: "1️⃣4️⃣ Watch Advertisement 7 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 15, title: "1️⃣5️⃣ Complete Quick Survey / Offer", link: "https://singingfiles.com/show.php?l=0&u=2547705&id=54741", reward: 0.80, type: "manual", instructions: "অফারটি সম্পন্ন করে প্রুফ স্ক্রিনশট ও ইউজারনেম জমা দিন।" },
  { id: 16, title: "1️⃣6️⃣ Watch Advertisement 8 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 17, title: "1️⃣7️⃣ Watch Advertisement 9 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 18, title: "1️⃣8️⃣ Watch Advertisement 10 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 19, title: "1️⃣9️⃣ Watch Advertisement 11 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" },
  { id: 20, title: "2️⃣0️⃣ Watch Advertisement 12 (30s)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80, type: "auto", instructions: "বিজ্ঞাপনটি ৩০ সেকেন্ড দেখুন।" }
];

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    loadTasks();
  } else {
    window.location.href = "login.html";
  }
});

async function loadTasks() {
  const container = document.getElementById('taskList') || document.getElementById('tasksList');
  if (!container) return;

  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const completedTasks = (userData.completedTaskIds && userData.lastTaskReset === today) 
      ? userData.completedTaskIds 
      : [];

    // 🎯 ইউজার এর প্ল্যান অনুযায়ী লিমিট নির্ণয়
    const userPlan = userData.plan || "Free Plan";
    const dailyLimit = PLAN_LIMITS[userPlan] || 10; // ডিফল্ট লিমিট ১০টি
    const completedTodayCount = completedTasks.length;
    const remainingTasks = Math.max(0, dailyLimit - completedTodayCount);

    // হেডার ইনফো আপডেট
    const remainingTasksElem = document.getElementById("remainingTasks");
    const taskRewardTextElem = document.getElementById("taskRewardText");
    const userPlanNameElem = document.getElementById("userPlanName");

    if (remainingTasksElem) remainingTasksElem.innerText = remainingTasks;
    if (taskRewardTextElem) taskRewardTextElem.innerText = `৳0.80`;
    if (userPlanNameElem) userPlanNameElem.innerText = userPlan;

    container.innerHTML = "";

    // 🛑 যদি দৈনিক লিমিট শেষ হয়ে যায়
    if (completedTodayCount >= dailyLimit) {
      container.innerHTML = `
        <div style="text-align: center; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 20px; border-radius: 12px; color: #fff;">
          <h3>⚠️ আজকের টাস্ক লিমিট শেষ!</h3>
          <p style="color: #cbd5e1;">আপনার <b>${userPlan}</b> প্ল্যানে দৈনিক লিমিট ছিল <b>${dailyLimit}টি</b>। আপনি সবগুলো সম্পন্ন করেছেন।</p>
          <a href="plans.html" style="display: inline-block; background: #00f2fe; color: #000; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; margin-top: 10px;">Upgrade Plan for More Tasks</a>
        </div>
      `;
      return;
    }

    // 📋 কাজগুলোর কার্ড তৈরি করা
    ALL_TASKS.forEach(task => {
      const isDone = completedTasks.includes(task.id);

      const card = document.createElement('div');
      card.className = "task-card";
      card.style.cssText = "padding: 18px; margin-bottom: 15px; border-radius: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; gap: 10px;";

      let proofFormHTML = "";
      if (task.type === "manual" && !isDone) {
        proofFormHTML = `
          <form id="proof-form-${task.id}" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
            <input type="text" id="user-info-${task.id}" placeholder="Your Username / Phone Number" class="proof-input" required style="padding: 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff;">
            <input type="url" id="img-url-${task.id}" placeholder="Screenshot Link (Imgur/PostImage)" class="proof-input" required style="padding: 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff;">
            <button type="submit" class="btn" style="background: #22c55e; color: #fff; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer;">Submit Proof</button>
          </form>
        `;
      }

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <div>
            <h4 style="color: #fff; margin: 0 0 5px 0; font-size: 1rem;">${task.title}</h4>
            <span style="color: #00f2fe; font-weight: bold; font-size: 0.9rem;">💰 Reward: ৳${task.reward.toFixed(2)}</span>
          </div>
          <div>
            ${task.type === "auto" ? `
              <button class="btn" id="task-btn-${task.id}" ${isDone ? "disabled style='background: #475569; cursor: not-allowed;'" : ""}>
                ${isDone ? "Completed ✅" : "Start Task"}
              </button>
            ` : `
              <a href="${task.link}" target="_blank" class="btn" style="background: #00f2fe; color: #000; padding: 8px 12px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Link</a>
            `}
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; color: #cbd5e1; border-left: 3px solid #00f2fe;">
          <strong>📌 ইনস্ট্রাকশন:</strong> ${task.instructions}
        </div>

        ${proofFormHTML}
      `;

      container.appendChild(card);

      // অটো টাইমার টাস্কের ইভেন্ট
      if (task.type === "auto" && !isDone) {
        document.getElementById(`task-btn-${task.id}`).addEventListener('click', () => {
          runTaskProcess(task, today, completedTasks, dailyLimit);
        });
      }

      // ম্যানুয়াল CPAGrip প্রুফ জমা ইভেন্ট
      if (task.type === "manual" && !isDone) {
        document.getElementById(`proof-form-${task.id}`).addEventListener('submit', (e) => {
          e.preventDefault();
          submitManualProof(task, today, completedTasks, dailyLimit);
        });
      }
    });

  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

// ⏱️ অটো টাইমার ও পুরষ্কার যোগ করার ফানশন
async function runTaskProcess(task, today, completedTasks, dailyLimit) {
  if (completedTasks.length >= dailyLimit) {
    showToast("⚠️ আপনার আজকের প্ল্যান লিমিট শেষ হয়ে গেছে!", "error");
    return;
  }

  const btn = document.getElementById(`task-btn-${task.id}`);
  btn.disabled = true;

  window.open(task.link, "_blank");

  let timer = 15;
  btn.innerText = `Wait ${timer}s...`;

  const interval = setInterval(async () => {
    timer--;
    btn.innerText = `Wait ${timer}s...`;

    if (timer <= 0) {
      clearInterval(interval);
      btn.innerText = "Claiming...";

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const updatedCompleted = [...completedTasks, task.id];

        await updateDoc(userRef, {
          balance: increment(task.reward),
          totalIncome: increment(task.reward),
          todayIncome: increment(task.reward),
          completedTaskIds: updatedCompleted,
          lastTaskReset: today
        });

        showToast(`Success! ৳${task.reward.toFixed(2)} added to balance.`);
        loadTasks(); // লিমিট ও ডিসপ্লে রিফ্রেশ করা

      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
        btn.innerText = "Start Task";
      }
    }
  }, 1000);
}

// 📤 CPAGrip অফারের জন্য ম্যানুয়াল প্রুফ জমা
async function submitManualProof(task, today, completedTasks, dailyLimit) {
  if (completedTasks.length >= dailyLimit) {
    showToast("⚠️ আপনার আজকের প্ল্যান লিমিট শেষ হয়ে গেছে!", "error");
    return;
  }

  const userInfo = document.getElementById(`user-info-${task.id}`).value;
  const imgUrl = document.getElementById(`img-url-${task.id}`).value;

  try {
    await addDoc(collection(db, "proofs"), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      taskId: task.id,
      taskTitle: task.title,
      proofDetails: userInfo,
      screenshotUrl: imgUrl,
      status: "pending",
      submittedAt: new Date().toISOString()
    });

    const userRef = doc(db, "users", currentUser.uid);
    const updatedCompleted = [...completedTasks, task.id];

    await updateDoc(userRef, {
      balance: increment(task.reward),
      totalIncome: increment(task.reward),
      todayIncome: increment(task.reward),
      completedTaskIds: updatedCompleted,
      lastTaskReset: today
    });

    showToast("✅ প্রুফ জমা হয়েছে এবং ব্যালেন্স যোগ করা হয়েছে!");
    loadTasks();

  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  }
      }
              
