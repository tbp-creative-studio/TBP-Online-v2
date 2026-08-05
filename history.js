import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadDepositHistory(); // বাই-ডিফল্ট ডিপোজিট হিস্ট্রি দেখাবে
  } else {
    window.location.href = "login.html";
  }
});

const depTab = document.getElementById('depTab');
const withTab = document.getElementById('withTab');
const container = document.getElementById('historyContainer');

// Tab Event Listeners
if (depTab && withTab) {
  depTab.addEventListener('click', () => {
    depTab.classList.add('active');
    withTab.classList.remove('active');
    loadDepositHistory();
  });

  withTab.addEventListener('click', () => {
    withTab.classList.add('active');
    depTab.classList.remove('active');
    loadWithdrawalHistory();
  });
}

// 📥 ১. ডিপোজিট হিস্ট্রি লোড
async function loadDepositHistory() {
  if (!currentUser) return;
  container.innerHTML = "<p style='text-align: center; color: #94a3b8;'>Loading deposits...</p>";

  try {
    // ইউজারের নিজ UID অথবা ৬ ডিজিটের userId দিয়ে ফিল্টার
    const q = query(collection(db, "deposits"), where("uid", "==", currentUser.uid));
    const snap = await getDocs(q);

    container.innerHTML = "";
    if (snap.empty) {
      container.innerHTML = "<p style='text-align: center; color: #94a3b8;'>No deposit history found.</p>";
      return;
    }

    snap.forEach(doc => {
      const d = doc.data();
      const item = document.createElement('div');
      item.className = "history-card";
      item.innerHTML = `
        <div class="history-info">
          <p style="color: #fff; font-weight: bold;">৳${d.amount || 0} (${d.method || 'N/A'})</p>
          <p style="color: #94a3b8; font-size: 0.8rem;">TrxID: ${d.trxId || 'N/A'}</p>
        </div>
        <div>
          <span class="status-badge status-${(d.status || 'pending').toLowerCase()}">${d.status || 'Pending'}</span>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='text-align: center; color: #ef4444;'>Error loading deposit history.</p>";
  }
}

// 📤 ২. উইথড্র হিস্ট্রি লোড
async function loadWithdrawalHistory() {
  if (!currentUser) return;
  container.innerHTML = "<p style='text-align: center; color: #94a3b8;'>Loading withdrawals...</p>";

  try {
    const q = query(collection(db, "withdrawals"), where("userId", "==", currentUser.uid));
    const snap = await getDocs(q);

    container.innerHTML = "";
    if (snap.empty) {
      container.innerHTML = "<p style='text-align: center; color: #94a3b8;'>No withdrawal history found.</p>";
      return;
    }

    snap.forEach(doc => {
      const w = doc.data();
      const item = document.createElement('div');
      item.className = "history-card";
      item.innerHTML = `
        <div class="history-info">
          <p style="color: #fff; font-weight: bold;">৳${w.amount || 0} (${w.method || 'N/A'})</p>
          <p style="color: #94a3b8; font-size: 0.8rem;">Number: ${w.accountNumber || w.phone || 'N/A'}</p>
        </div>
        <div>
          <span class="status-badge status-${(w.status || 'pending').toLowerCase()}">${w.status || 'Pending'}</span>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='text-align: center; color: #ef4444;'>Error loading withdrawal history.</p>";
  }
}
