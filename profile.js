import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById('profName').innerText = data.name;
      document.getElementById('profEmail').innerText = data.email;
      document.getElementById('profUid').innerText = user.uid;
      document.getElementById('profJoined').innerText = new Date(data.createdAt).toLocaleDateString();
      document.getElementById('avatar').innerText = data.name.charAt(0).toUpperCase();
    }
  }
});
