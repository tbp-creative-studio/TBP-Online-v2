import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser = null;
onAuthStateChanged(auth, (user) => { currentUser = user; });

document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!currentUser) return;

  const amount = parseFloat(document.getElementById('amount').value);
  const accountNumber = document.getElementById('accountNumber').value.trim();
  const method = document.getElementById('method').value;

  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  if (userSnap.data().balance < amount) {
    showToast("Insufficient Balance!", "error");
    return;
  }

  try {
    await addDoc(collection(db, "withdraws"), {
      uid: currentUser.uid,
      accountNumber,
      method,
      amount,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    showToast("Withdraw Request Submitted!");
    window.location.href = "dashboard.html";
  } catch(err) {
    showToast(err.message, "error");
  }
});

