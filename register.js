import { auth, db, showToast } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc, getDocs, collection, query, where, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const refCode = document.getElementById('refCode').value.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Check referral logic
    if (refCode) {
      const q = query(collection(db, "users"), where("email", "==", refCode));
      const refDocs = await getDocs(q);
      if(!refDocs.empty) {
        const refUser = refDocs.docs[0];
        await updateDoc(doc(db, "users", refUser.id), {
          balance: increment(1.0),
          referral: increment(1)
        });
      }
    }

    // Save User to Firestore
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      balance: 0,
      referral: 0,
      todayIncome: 0,
      totalIncome: 0,
      withdraw: 0,
      deposit: 0,
      vip: "Free",
      lastBonusClaim: null,
      createdAt: new Date().toISOString()
    });

    showToast("Registration Successful!");
    window.location.href = "login.html";
  } catch (err) {
    showToast(err.message, "error");
  }
});

