import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const sampleTasks = [
  { id: 1, title: "Watch YouTube Video", reward: 0.20 },
  { id: 2, title: "Visit Partner Website", reward: 0.15 },
  { id: 3, title: "Follow Telegram Channel", reward: 0.25 }
];

onAuthStateChanged(auth, (user) => {
  const container = document.getElementById('tasksList');
  if(!container) return;

  sampleTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.innerHTML = `
      <h3>${task.title}</h3>
      <p style="color: var(--accent-green); margin: 10px 0;">Reward: $${task.reward.toFixed(2)}</p>
      <button class="btn" id="task-${task.id}">Complete Task</button>
    `;
    container.appendChild(card);

    document.getElementById(`task-${task.id}`).addEventListener('click', async () => {
      if(!user) return;
      await updateDoc(doc(db, "users", user.uid), {
        balance: increment(task.reward),
        totalIncome: increment(task.reward),
        todayIncome: increment(task.reward)
      });
      showToast(`Task Complete! Earned $${task.reward}`);
    });
  });
});

