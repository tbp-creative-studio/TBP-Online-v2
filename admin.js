import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ⚠️ এখানে আপনার নিজের জিমেইল অ্যাড্রেসটি বসান
const ADMIN_EMAIL = "your-admin-email@gmail.com"; 

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
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
        <p><b>Deposit Req:</b> ${data.email} | <b>Method:</b> ${data.method} | <b>Amount:</b> ৳${data.amount} | <b>TrxID:</b> ${data.trxId}</p>
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
        <p><b>Task Proof:</b> ${data.userEmail} | <b>Task:</b> ${data.taskTitle} | <b>Reward:</b> ৳${data.reward}</p>
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
