import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser = null;
onAuthStateChanged(auth, (user) => { currentUser = user; });

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newName = document.getElementById('newName').value.trim();
  if (!newName || !currentUser) return;

  try {
    await updateDoc(doc(db, "users", currentUser.uid), { name: newName });
    showToast("Profile Name Updated!");
  } catch(err) {
    showToast(err.message, "error");
  }
});
