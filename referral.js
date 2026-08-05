import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loadReferralData(user.uid);
  }
});

async function loadReferralData(uid) {
  try {
    // ইউজারের নিজস্ব তথ্য আনা
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) return;
    const userData = userDoc.data();

    // ইউজারের রেফারাল লিংক তৈরি করা
    const myRefId = userData.userId;
    const siteUrl = window.location.origin;
    const refLink = `${siteUrl}/register.html?ref=${myRefId}`;

    const refInput = document.getElementById('referralLinkInput');
    if (refInput) refInput.value = refLink;

    const refIdShow = document.getElementById('myUserIdShow');
    if (refIdShow) refIdShow.innerText = myRefId;

    // এই রেফারাল আইডি দিয়ে কারা অ্যাকাউন্ট খুলেছে তাদের তালিকা আনা
    const q = query(collection(db, "users"), where("referredBy", "==", myRefId));
    const querySnapshot = await getDocs(q);

    const teamList = document.getElementById('referralTeamList');
    if (teamList) {
      teamList.innerHTML = "";
      if (querySnapshot.empty) {
        teamList.innerHTML = "<p style='color: var(--text-secondary);'>No team members joined yet.</p>";
        return;
      }

      querySnapshot.forEach((docSnap) => {
        const member = docSnap.data();
        const item = document.createElement('div');
        item.className = 'glass-card';
        item.style.marginBottom = '10px';
        item.style.padding = '10px 15px';
        item.innerHTML = `
          <p><b>Name:</b> ${member.name} | <b>ID:</b> ${member.userId}</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Joined: ${new Date(member.createdAt).toLocaleDateString()}</p>
        `;
        teamList.appendChild(item);
      });
    }

  } catch (err) {
    console.error(err);
  }
}
