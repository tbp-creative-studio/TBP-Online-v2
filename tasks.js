import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ইউটিউব টাস্কের তালিকা (সময়সীমা সহ)
const youtubeTasks = [
  { id: "task_yt_1", title: "Watch YouTube Video 1", duration: "2", reward: 5, videoUrl: "https://youtube.com" },
  { id: "task_yt_2", title: "Watch YouTube Video 2", duration: "3", reward: 8, videoUrl: "https://youtube.com" },
  { id: "task_yt_3", title: "Watch YouTube Video 3", duration: "5", reward: 12, videoUrl: "https://youtube.com" }
];

let currentUser = null;
let selectedTask = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const container = document.getElementById('tasksList');
  if(!container) return;

  container.innerHTML = "";
  youtubeTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.innerHTML = `
      <h3>${task.title}</h3>
      <p style="color: var(--accent-cyan); margin-top: 5px;">⏱️ Duration: ${task.duration} Minutes</p>
      <p style="color: var(--accent-green); margin: 10px 0;">Reward: ৳${task.reward}</p>
      <button class="btn" id="btn-${task.id}">Start Task</button>
    `;
    container.appendChild(card);

    document.getElementById(`btn-${task.id}`).addEventListener('click', () => {
      selectedTask = task;
      document.getElementById('taskModal').style.display = 'block';
      document.getElementById('modalTaskTitle').innerText = task.title;
      document.getElementById('modalTaskDuration').innerText = task.duration;
      document.getElementById('modalVideoLink').href = task.videoUrl;
      window.scrollTo({ top: document.getElementById('taskModal').offsetTop, behavior: 'smooth' });
    });
  });
});

// প্রমাণ জমা দেওয়ার হ্যান্ডলার
document.getElementById('taskProofForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || !selectedTask) {
    showToast("Please login to submit proof!", "error");
    return;
  }

  const startScreenshot = document.getElementById('startScreenshot').value.trim();
  const endScreenshot = document.getElementById('endScreenshot').value.trim();

  try {
    // Firestore-এ সাবমিশন সেভ হবে
    await addDoc(collection(db, "task_submissions"), {
      uid: currentUser.uid,
      userEmail: currentUser.email,
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      reward: selectedTask.reward,
      startScreenshot,
      endScreenshot,
      status: "pending", // Admin চেক করে এপ্রুভ করবে
      submittedAt: new Date().toISOString()
    });

    showToast("Proof Submitted Successfully! Waiting for Admin Review.");
    document.getElementById('taskProofForm').reset();
    document.getElementById('taskModal').style.display = 'none';
  } catch (err) {
    showToast(err.message, "error");
  }
});
