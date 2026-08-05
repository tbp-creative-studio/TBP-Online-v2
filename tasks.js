import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// আপনার দেয়া আসল ১০টি টাস্কের তালিকা ও সঠিক লিংক
const FREE_TASKS = [
  { id: 1, title: "1️⃣ Subscribe TBP Creative Studio", link: "https://youtube.com/@tbpcreativestudio?si=jAC_80ddm38JcNmV", reward: 0.80 },
  { id: 2, title: "2️⃣ Watch Advertisement (30 Seconds)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80 },
  { id: 3, title: "3️⃣ Watch Advertisement (30 Seconds)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80 },
  { id: 4, title: "4️⃣ Join Telegram Channel", link: "https://t.me/your_telegram_channel", reward: 0.80 }, // আপনার টেলিগ্রাম লিঙ্ক দিন
  { id: 5, title: "5️⃣ Watch Advertisement (30 Seconds)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80 },
  { id: 6, title: "6️⃣ Watch YouTube Video (1 Minute)", link: "https://youtu.be/GXOqWAmFr24?si=PSEpIGjZ8jU2yv2o", reward: 0.80 },
  { id: 7, title: "7️⃣ Watch Advertisement (30 Seconds)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80 },
  { id: 8, title: "8️⃣ Watch Advertisement (30 Seconds)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80 },
  { id: 9, title: "9️⃣ Watch Advertisement (30 Seconds)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80 },
  { id: 10, title: "🔟 Watch Advertisement (30 Seconds)", link: "https://www.effectivecpmnetwork.com/aq96yjcs3?key=a630e0faa0d6cdf25528d1e9db62cf41", reward: 0.80 }
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

    container.innerHTML = "";

    FREE_TASKS.forEach(task => {
      const isDone = completedTasks.includes(task.id);

      const card = document.createElement('div');
      card.className = "glass-card";
      card.style.cssText = "padding: 15px; margin-bottom: 15px; border-radius: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;";

      card.innerHTML = `
        <div>
          <h4 style="color: #fff; margin: 0 0 5px 0; font-size: 1rem;">${task.title}</h4>
          <span style="color: #00f2fe; font-weight: bold; font-size: 0.9rem;">💰 Reward: ৳${task.reward.toFixed(2)}</span>
        </div>
        <div>
          <button class="btn" id="task-btn-${task.id}" ${isDone ? "disabled style='background: #475569; cursor: not-allowed;'" : ""}>
            ${isDone ? "Completed ✅" : "Start Task"}
          </button>
        </div>
      `;

      container.appendChild(card);

      if (!isDone) {
        document.getElementById(`task-btn-${task.id}`).addEventListener('click', () => {
          runTaskProcess(task, today, completedTasks);
        });
      }
    });

  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

// টাস্ক কাউন্টডাউন এবং পুরষ্কার যোগ করার ফানশন
async function runTaskProcess(task, today, completedTasks) {
  const btn = document.getElementById(`task-btn-${task.id}`);
  btn.disabled = true;

  // অ্যাড/ইউটিউব লিংক নতুন ট্যাবে খোলা
  window.open(task.link, "_blank");

  let timer = 15; // ১৫ সেকেন্ড কাউন্টডাউন
  btn.innerText = `Wait ${timer}s...`;

  const interval = setInterval(async () => {
    timer--;
    btn.innerText = `Wait ${timer}s...`;

    if (timer <= 0) {
      clearInterval(interval);
      btn.innerText = "Claiming...";

      try {
        const userRef = doc(db, "users", currentUser.uid);
        
        // টাস্কটি কমপ্লিট লিস্টে যোগ করা
        const updatedCompleted = [...completedTasks, task.id];

        await updateDoc(userRef, {
          balance: increment(task.reward),
          totalIncome: increment(task.reward),
          todayIncome: increment(task.reward),
          completedTaskIds: updatedCompleted,
          lastTaskReset: today
        });

        showToast(`Success! ৳${task.reward.toFixed(2)} added to balance.`);
        btn.innerText = "Completed ✅";
        btn.style.background = "#475569";

      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
        btn.innerText = "Start Task";
      }
    }
  }, 1000);
                               }
