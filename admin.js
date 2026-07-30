import { db, showToast } from "./firebase.js";
import { collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function loadDeposits() {
  const container = document.getElementById('depositsList');
  if(!container) return;

  const snap = await getDocs(collection(db, "deposits"));
  container.innerHTML = "";

  snap.forEach(d => {
    const data = d.data();
    if(data.status === "pending") {
      const item = document.createElement('div');
      item.className = "glass-card";
      item.style.marginBottom = "10px";
      item.innerHTML = `
        <p>User: ${data.email} | Amount: $${data.amount} | TrxID: ${data.trxId}</p>
        <button class="btn" style="background: var(--accent-green); margin-top: 10px;" id="approve-${d.id}">Approve</button>
      `;
      container.appendChild(item);

      document.getElementById(`approve-${d.id}`).addEventListener('click', async () => {
        await updateDoc(doc(db, "deposits", d.id), { status: "approved" });
        await updateDoc(doc(db, "users", data.uid), {
          balance: increment(data.amount),
          deposit: increment(data.amount)
        });
        showToast("Deposit Approved!");
        loadDeposits();
      });
    }
  });
}

loadDeposits();
