import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser = null;
onAuthStateChanged(auth, (user) => { currentUser = user; });

document.getElementById('depositForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!currentUser) return;

  const method = document.getElementById('method').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const trxId = document.getElementById('trxId').value.trim();

  if (amount < 100) {
    showToast("Minimum Deposit is ৳100!", "error");
    return;
  }

  try {
    await addDoc(collection(db, "deposits"), {
      uid: currentUser.uid,
      email: currentUser.email,
      method,
      amount,
      trxId,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    showToast("Deposit Request Submitted!");
    window.location.href = "dashboard.html";
  } catch(err) {
    showToast(err.message, "error");
  }
});
