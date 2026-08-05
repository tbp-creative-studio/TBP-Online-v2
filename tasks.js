import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ইউটিউব টাস্কের তালিকা (সময়সীমা সহ)
const youtubeTasks = [
  { id: "task_yt_1", title: "Watch YouTube Video 1", duration: "2", reward: 5, videoUrl: "https://youtube.com" },
  { id: "task_yt_2", title: "Watch YouTube Video 2", duration: "3", reward: 8, videoUrl: "https://youtube.com" },
  { id: "task_yt_3", title: "Watch YouTube Video 3", duration: "5", reward: 12, videoUrl: "https://youtube.com" }
];

let currentUser = null;
let selectedTask = null;

// ইউজার লগইন চেক ও টাস্ক প্রদর্শন
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  const container = document.getElementById('taskList') || document.getElementById('tasksList');
  if (!container) return;

  container.innerHTML = "";

  // টাস্ক কার্ড জেনারেট করা
  youtubeTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.cssText = "padding: 15px; margin-bottom: 15px; border-radius: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1);";
    
    card.innerHTML = `
      <h3 style="color: #fff; margin-bottom: 5px;">${task.title}</h3>
      <p style="color: #00f2fe; margin-top: 5px; font-size: 0.9rem;">⏱️ Duration: ${task.duration} Minutes</p>
      <p style="color: #28a745; margin: 10px 0; font-weight: bold;">Reward: ৳${task.reward}</p>
      <button class="btn" id="btn-${task.id}">Start Task</button>
    `;
    container.appendChild(card);

    // "Start Task" বাটনে ক্লিক করলে মোডাল পপ-আপ ওপেন হবে
    document.getElementById(`btn-${task.id}`).addEventListener('click', () => {
      selectedTask = task;
      const modal = document.getElementById('taskModal');
      
      if (modal) {
        modal.style.display = 'block';
        if (document.getElementById('modalTaskTitle')) document.getElementById('modalTaskTitle').innerText = task.title;
        if (document.getElementById('modalTaskDuration')) document.getElementById('modalTaskDuration').innerText = task.duration;
        if (document.getElementById('modalVideoLink')) document.getElementById('modalVideoLink').href = task.videoUrl;
        
        window.scrollTo({ top: modal.offsetTop, behavior: 'smooth' });
      }
    });
  });
});

// প্রমাণ (Proof) জমা দেওয়ার ফর্ম হ্যান্ডলার
const proofForm = document.getElementById('taskProofForm');
if (proofForm) {
  proofForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser || !selectedTask) {
      showToast("Please login to submit proof!", "error");
      return;
    }

    const startScreenshot = document.getElementById('startScreenshot')?.value.trim() || "";
    const endScreenshot = document.getElementById('endScreenshot')?.value.trim() || "";

    if (!startScreenshot || !endScreenshot) {
      showToast("Please provide both start and end screenshot links!", "error");
      return;
    }

    try {
      // ইউজার ডাটা আনা (ইউজার আইডি সঠিক রাখার জন্য)
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Firestore-এর task_submissions কালেকশনে তথ্য সেভ হবে
      await addDoc(collection(db, "task_submissions"), {
        uid: currentUser.uid,
        userId: userData.userId || currentUser.uid, // ৬ ডিজিটের ইউনিক ইউজার আইডি
        userName: userData.name || "Unknown",
        userEmail: currentUser.email,
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        reward: selectedTask.reward,
        startScreenshot: startScreenshot,
        endScreenshot: endScreenshot,
        status: "pending", // অ্যাডমিন এপ্রুভালের জন্য অপেক্ষা করবে
        submittedAt: new Date().toISOString()
      });

      showToast("Proof Submitted Successfully! Waiting for Admin Review.");
      proofForm.reset();
      
      const modal = document.getElementById('taskModal');
      if (modal) modal.style.display = 'none';

    } catch (err) {
      showToast(err.message, "error");
    }
  });
}
