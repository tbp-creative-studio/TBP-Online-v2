import { auth, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    const codeElem = document.getElementById('myRefCode');
    codeElem.innerText = user.email; // Using User Email as Ref Code

    document.getElementById('copyBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(user.email);
      showToast("Referral Code Copied!");
    });
  }
});
