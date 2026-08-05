import { auth, db, showToast } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  increment 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser = null;
onAuthStateChanged(auth, (user) => { currentUser = user; });

const withdrawForm = document.getElementById('withdrawForm');

if (withdrawForm) {
  withdrawForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please login first!", "error");
      return;
    }

    const amount = parseFloat(document.getElementById('amount').value);
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const method = document.getElementById('method').value;

    // ১. মিনিমাম উইথড্র লিমিট চেক
    if (amount < 200) {
      showToast("Minimum Withdraw is ৳200!", "error");
      return;
    }

    try {
      // ২. ইউজারের পর্যাপ্ত ব্যালেন্স আছে কি না চেক
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const currentBalance = userSnap.data()?.balance || 0;

      if (currentBalance < amount) {
        showToast("Insufficient Balance!", "error");
        return;
      }

      // ৩. উইথড্র রিকোয়েস্ট ফায়ারবেসে জমা করা (admin.js-এর সাথে কালেকশন নাম 'withdrawals' মেলানো হয়েছে)
      await addDoc(collection(db, "withdrawals"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        accountNumber: accountNumber,
        method: method,
        amount: amount,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      // 💡 ৪. সঙ্গে সঙ্গে ইউজারের ব্যালেন্স থেকে টাকা কেটে নেওয়া এবং মোট উইথড্র হিসাব বাড়ানো
      await updateDoc(userRef, {
        balance: increment(-amount),
        withdraw: increment(amount)
      });

      showToast("Withdraw Request Submitted!");

      // ড্যাশবোর্ডে রিডাইরেক্ট
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);

    } catch (err) {
      showToast(err.message, "error");
    }
  });
}
