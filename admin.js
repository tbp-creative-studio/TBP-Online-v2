import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  increment,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 👑 অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "mrx2580a1@gmail.com"; 

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    showToast("Access Denied! Admin Only.", "error");
    window.location.href = "dashboard.html";
    return;
  }

  loadDeposits();
  loadTaskProofSubmissions();
  loadWithdrawals();
});

// ---------------------------------------------------------
// ১. নতুন কাজ যোগ করার ফাংশন
// ---------------------------------------------------------
const addTaskForm = document.getElementById('addTaskForm');
if (addTaskForm) {
  addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const link = document.getElementById('taskLink').value.trim();
    const reward = Number(document.getElementById('taskReward').value);

    try {
      await addDoc(collection(db, "tasks"), {
        title,
        link,
        reward,
        createdAt: new Date().toISOString()
      });
      showToast("Task Added Successfully!");
      addTaskForm.reset();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// ---------------------------------------------------------
// ২. ইউজার আইডিতে ম্যানুয়ালি ব্যালেন্স যোগ করার ফাংশন
// ---------------------------------------------------------
const addBalanceForm = document.getElementById('addBalanceForm');
if (addBalanceForm) {
  addBalanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = document.getElementById('targetUserId').value.trim();
    const amount = Number(document.getElementById('addAmount').value);

    try {
      let userRef;
      if (userInput.includes('@')) {
        // ইমেইল দিয়ে ইউজার খ খোঁজা
        const q = query(collection(db, "users"), where("email", "==", userInput));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("User with this email not found!");
        userRef = doc(db, "users", snap.docs[0].id);
      } else {
        // UID দিয়ে ইউজার খোঁজা
        userRef = doc(db, "users", userInput);
      }

      await updateDoc(userRef, {
        balance: increment(amount)
      });

      showToast(`Successfully added ৳${amount} to User!`);
      addBalanceForm.reset();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// ---------------------------------------------------------
// ৩. ডিপোজিট রিকোয়েস্ট লোড করার ফাংশন
// ---------------------------------------------------------
async function loadDeposits() {
  const container = document.getElementById('depositsList');
  if (!container) return;

  const snap = await getDocs(collection(db, "deposits"));
  container.innerHTML = "";

  let count = 0;
  snap.forEach(d => {
    const data = d.data();
    if (data.status === "pending") {
      count++;
      const item = document.createElement('div');
      item.className = "glass-card";
      item.style.marginBottom = "15px";
      item.innerHTML = `
        <p><b>User:</b> ${data.email || data.userId} | <b>Method:</b> ${data.method} | <b>Amount:</b> ৳${data.amount}</p>
        <p><b>TrxID:</b> ${data.trxId}</p>
        <button class="btn" style="background: var(--accent-green); margin-top: 10px;" id="approve-dep-${d.id}">Approve Deposit</button>
      `;
      container.appendChild(item);

      document.getElementById(`approve-dep-${d.id}`).addEventListener('click', async () => {
        await updateDoc(doc(db, "deposits", d.id), { status: "approved" });
        await updateDoc(doc(db, "users", data.userId || data.uid), {
          balance: increment(data.amount),
          deposit: increment(data.amount)
        });
        showToast("Deposit Approved!");
        loadDeposits();
      });
    }
  });

  if (count === 0) container.innerHTML = "<p style='color: var(--text-secondary);'>No pending deposits.</p>";
}

// ---------------------------------------------------------
// ৪. উইথড্র রিকোয়েস্ট লোড এবং অ্যাপ্রুভ/রিজেক্ট ফাংশন
// ---------------------------------------------------------
async function loadWithdrawals() {
  const container = document.getElementById('withdrawalsList');
  if (!container) return;

  const snap = await getDocs(collection(db, "withdrawals"));
  container.innerHTML = "";

  let count = 0;
  snap.forEach(d => {
    const data = d.data();
    if (data.status === "pending") {
      count++;
      const item = document.createElement('div');
      item.className = "glass-card";
      item.style.marginBottom = "15px";
      item.innerHTML = `
        <p><b>User Email:</b> ${data.userEmail || 'N/A'}</p>
        <p><b>Method:</b> ${data.method} | <b>Number:</b> <span style="color: var(--accent-cyan); font-weight: bold;">${data.accountNumber}</span></p>
        <p><b>Amount:</b> ৳${data.amount}</p>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn" style="background: var(--accent-green);" id="approve-wd-${d.id}">Approve Payment</button>
          <button class="btn" style="background: #dc3545;" id="reject-wd-${d.id}">Reject & Refund</button>
        </div>
      `;
      container.appendChild(item);

      // এপ্রুভ করা
      document.getElementById(`approve-wd-${d.id}`).addEventListener('click', async () => {
        await updateDoc(doc(db, "withdrawals", d.id), { status: "approved" });
        showToast("Withdrawal Approved Successfully!");
        loadWithdrawals();
      });

      // রিজেক্ট করা (রিজেক্ট করলে কাটা ব্যালেন্স ফেরত পাবে)
      document.getElementById(`reject-wd-${d.id}`).addEventListener('click', async () => {
        await updateDoc(doc(db, "withdrawals", d.id), { status: "rejected" });
        await updateDoc(doc(db, "users", data.userId), {
          balance: increment(data.amount),
          withdraw: increment(-data.amount)
        });
        showToast("Withdrawal Rejected & Amount Refunded!");
        loadWithdrawals();
      });
    }
  });

  if (count === 0) container.innerHTML = "<p style='color: var(--text-secondary);'>No pending withdrawal requests.</p>";
}

// ---------------------------------------------------------
// ৫. টাস্ক স্ক্রিনশট প্রুফ দেখা
// ---------------------------------------------------------
async function loadTaskProofSubmissions() {
  const snap = await getDocs(collection(db, "task_submissions"));
  snap.forEach(d => {
    const data = d.data();
    if (data.status === "pending") {
      // হ্যান্ডলিং
    }
  });
               }
