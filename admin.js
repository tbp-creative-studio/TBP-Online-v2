import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  collection, 
  getDocs, 
  getDoc,
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
    if (typeof showToast === "function") showToast("Access Denied! Admin Only.", "error");
    else alert("Access Denied! Admin Only.");
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
// ২. ইউজার আইডি (239551) বা Email দিয়ে ম্যানুয়ালি ব্যালেন্স যোগ
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
        // ইমেইল দিয়ে ইউজার খোঁজা
        const q = query(collection(db, "users"), where("email", "==", userInput));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("User with this email not found!");
        userRef = doc(db, "users", snap.docs[0].id);
      } else if (userInput.length === 6) {
        // ৬ সংখ্যার ইউজার আইডি (userId) দিয়ে খোঁজা
        const q = query(collection(db, "users"), where("userId", "==", userInput));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("User with this ID not found!");
        userRef = doc(db, "users", snap.docs[0].id);
      } else {
        // ফায়ারবেস UID দিয়ে খোঁজা
        userRef = doc(db, "users", userInput);
      }

      await updateDoc(userRef, {
        balance: increment(amount),
        deposit: increment(amount)
      });

      showToast(`Successfully added ৳${amount} to User!`);
      addBalanceForm.reset();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// ---------------------------------------------------------
// ৩. ডিপোজিট রিকোয়েস্ট লোড + ২% রেফার বোনাস দেওয়ার লজিক
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
        <p><b>User:</b> ${data.email || data.userId || data.uid} | <b>Method:</b> ${data.method} | <b>Amount:</b> ৳${data.amount}</p>
        <p><b>TrxID:</b> ${data.trxId}</p>
        <button class="btn" style="background: var(--accent-green, #28a745); color:#fff; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; margin-top: 10px;" id="approve-dep-${d.id}">Approve Deposit</button>
      `;
      container.appendChild(item);

      document.getElementById(`approve-dep-${d.id}`).addEventListener('click', async () => {
        try {
          const depAmount = Number(data.amount);
          
          // সঠিক Firestore Document ID খোঁজা
          let userDocId = data.uid;
          if (!userDocId && data.userId) {
            const q = query(collection(db, "users"), where("userId", "==", data.userId));
            const uSnap = await getDocs(q);
            if (!uSnap.empty) userDocId = uSnap.docs[0].id;
          }

          if (!userDocId) throw new Error("User record not found!");

          // ১. ডিপোজিট স্ট্যাটাস আপডেট
          await updateDoc(doc(db, "deposits", d.id), { status: "approved" });

          // ২. ইউজারের মেইন ব্যালেন্স ও মোট ডিপোজিট বাড়ানো
          await updateDoc(doc(db, "users", userDocId), {
            balance: increment(depAmount),
            deposit: increment(depAmount)
          });

          // 💡 ৩. রেফারাল ২% কমিশন দেওয়ার লজিক
          const userSnap = await getDoc(doc(db, "users", userDocId));
          if (userSnap.exists()) {
            const uData = userSnap.data();
            const referrerCode = uData.referredBy; // রেফারারের ৬ ডিজিটের আইডি

            if (referrerCode) {
              const refQuery = query(collection(db, "users"), where("userId", "==", referrerCode));
              const refSnap = await getDocs(refQuery);

              if (!refSnap.empty) {
                const referrerDoc = refSnap.docs[0];
                const commission = (depAmount * 2) / 100; // ২% কমিশন

                // রেফারালের মালিকের অ্যাকাউন্টে টাকা পাঠানো
                await updateDoc(doc(db, "users", referrerDoc.id), {
                  balance: increment(commission),
                  totalIncome: increment(commission)
                });
                showToast(`Bonus ৳${commission} (2%) sent to Referrer!`);
              }
            }
          }

          showToast("Deposit Approved Successfully!");
          loadDeposits();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }
  });

  if (count === 0) container.innerHTML = "<p style='color: var(--text-secondary);'>No pending deposits.</p>";
}

// ---------------------------------------------------------
// ৪. উইথড্র রিকোয়েস্ট লোড এবং অ্যাপ্রুভ/রিজেক্ট (With Auto Refund)
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
        <p><b>Method:</b> ${data.method} | <b>Number:</b> <span style="color: var(--accent-cyan, #00f2fe); font-weight: bold;">${data.accountNumber}</span></p>
        <p><b>Amount:</b> ৳${data.amount}</p>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn" style="background: var(--accent-green, #28a745); color:#fff; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;" id="approve-wd-${d.id}">Approve Payment</button>
          <button class="btn" style="background: #dc3545; color:#fff; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;" id="reject-wd-${d.id}">Reject & Refund</button>
        </div>
      `;
      container.appendChild(item);

      // এপ্রুভ করা
      document.getElementById(`approve-wd-${d.id}`).addEventListener('click', async () => {
        try {
          await updateDoc(doc(db, "withdrawals", d.id), { status: "approved" });
          showToast("Withdrawal Approved Successfully!");
          loadWithdrawals();
        } catch(err) {
          showToast(err.message, "error");
        }
      });

      // রিজেক্ট করা (রিজেক্ট করলে কাটা টাকা ব্যাক চলে যাবে)
      document.getElementById(`reject-wd-${d.id}`).addEventListener('click', async () => {
        try {
          await updateDoc(doc(db, "withdrawals", d.id), { status: "rejected" });
          
          let targetId = data.userId || data.uid;
          if (targetId) {
            await updateDoc(doc(db, "users", targetId), {
              balance: increment(data.amount),
              withdraw: increment(-data.amount)
            });
          }
          showToast("Withdrawal Rejected & Amount Refunded!");
          loadWithdrawals();
        } catch(err) {
          showToast(err.message, "error");
        }
      });
    }
  });

  if (count === 0) container.innerHTML = "<p style='color: var(--text-secondary);'>No pending withdrawal requests.</p>";
}

// ---------------------------------------------------------
// ৫. টাস্ক প্রুফ সাবমিশন হ্যান্ডলিং
// ---------------------------------------------------------
async function loadTaskProofSubmissions() {
  try {
    const snap = await getDocs(collection(db, "task_submissions"));
    snap.forEach(d => {
      const data = d.data();
      if (data.status === "pending") {
        // প্রয়োজনীয় প্রুফ সাবমিশন লজিক এখানে যুক্ত করা যাবে
      }
    });
  } catch(e) {
    console.log("No task submissions yet");
  }
            }
import { db, showToast } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const addTaskForm = document.getElementById("addTaskForm");

if (addTaskForm) {
  addTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("taskTitle").value;
    const link = document.getElementById("taskLink").value;
    const type = document.getElementById("taskType").value;
    const instructions = document.getElementById("taskInstructions").value;

    try {
      // 🚀 ফায়ারবেসের 'tasks' কালেকশনে নতুন টাস্ক যোগ করা
      await addDoc(collection(db, "tasks"), {
        title: title,
        link: link,
        type: type,
        reward: 0.80, // ডিফল্ট রিওয়ার্ড
        instructions: instructions,
        createdAt: new Date().toISOString()
      });

      showToast("✅ নতুন টাস্ক সফলভাবে যুক্ত করা হয়েছে!");
      addTaskForm.reset(); // ফর্ম খালি করা

    } catch (error) {
      console.error("Error adding task: ", error);
      showToast("❌ Error: " + error.message, "error");
    }
  });
}
