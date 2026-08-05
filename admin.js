import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 👑 আপনার সঠিক অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "mrx2580a1@gmail.com"; 

onAuthStateChanged(auth, async (user) => {
  // ইমেইল কেস-সেনসিটিভ যাতে না হয় তার জন্য toLowerCase() ব্যবহার করা হয়েছে
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    showToast("Access Denied! Admin Only.", "error");
    window.location.href = "dashboard.html";
    return;
  }

  loadDeposits();
  loadTaskProofSubmissions();
});

// ১. পেন্ডিং ডিপোজিট এপ্রুভ করার ফাংশন
async function loadDeposits() {
  const container = document.getElementById('depositsList');
  if(!container) return;

  const snap = await getDocs(collection(db, "deposits"));

  snap.forEach(d => {
    const data = d.data();
    if(data.status === "pending") {
      const item = document.createElement('div');
      item.className = "glass-card";
      item.style.marginBottom = "15px";
      item.innerHTML = `
        <p><b>Deposit Req:</b> ${data.email || 'N/A'} | <b>Method:</b> ${data.method} | <b>Amount:</b> ৳${data.amount} | <b>TrxID:</b> ${data.trxId}</p>
        <button class="btn" style="background: var(--accent-green); margin-top: 10px;" id="approve-dep-${d.id}">Approve Deposit</button>
      `;
      container.appendChild(item);

      document.getElementById(`approve-dep-${d.id}`).addEventListener('click', async () => {
        await updateDoc(doc(db, "deposits", d.id), { status: "approved" });
        await updateDoc(doc(db, "users", data.uid), {
          balance: increment(data.amount),
          deposit: increment(data.amount)
        });
        showToast("Deposit Approved!");
        location.reload();
      });
    }
  });
}

// ২. টাস্কের স্ক্রিনশট দেখে বোনাস এপ্রুভ করার ফাংশন
async function loadTaskProofSubmissions() {
  const container = document.getElementById('depositsList');
  if(!container) return;

  const snap = await getDocs(collection(db, "task_submissions"));

  snap.forEach(d => {
    const data = d.data();
    if(data.status === "pending") {
      const item = document.createElement('div');
      item.className = "glass-card";
      item.style.marginBottom = "15px";
      item.innerHTML = `
        <p><b>Task Proof:</b> ${data.userEmail || 'N/A'} | <b>Task:</b> ${data.taskTitle} | <b>Reward:</b> ৳${data.reward}</p>
        <p style="margin: 8px 0;">
          📸 <a href="${data.startScreenshot}" target="_blank" style="color: var(--accent-cyan); text-decoration: underline;">View Start Screenshot</a> | 
          📸 <a href="${data.endScreenshot}" target="_blank" style="color: var(--accent-cyan); text-decoration: underline;">View End Screenshot</a>
        </p>
        <button class="btn" style="background: var(--accent-green);" id="approve-task-${d.id}">Approve Task & Pay ৳${data.reward}</button>
      `;
      container.appendChild(item);

      document.getElementById(`approve-task-${d.id}`).addEventListener('click', async () => {
        await updateDoc(doc(db, "task_submissions", d.id), { status: "approved" });
        await updateDoc(doc(db, "users", data.uid), {
          balance: increment(data.reward),
          totalIncome: increment(data.reward),
          todayIncome: increment(data.reward)
        });
        showToast("Task Approved & Reward Added!");
        location.reload();
      });
    }
  });
}
import { addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// অ্যাডমিন নতুন কাজ সেভ করার কোড
const addTaskForm = document.getElementById('addTaskForm');
if (addTaskForm) {
  addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const link = document.getElementById('taskLink').value.trim();
    const reward = Number(document.getElementById('taskReward').value);

    try {
      await addDoc(collection(db, "tasks"), {
        title: title,
        link: link,
        reward: reward,
        createdAt: new Date().toISOString()
      });
      showToast("Task Added Successfully!");
      addTaskForm.reset();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

