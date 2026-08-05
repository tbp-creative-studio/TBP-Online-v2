import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 🚀 আপনার পাঠানো সব সোশ্যাল মিডিয়া লিংক ও টাস্ক লিস্ট
const taskListToSeed = [
  {
    title: "Subscribe YouTube Channel",
    link: "https://youtube.com/@mentalversion?si=AphAqBLbN4NND3Hc",
    platform: "YouTube",
    createdAt: new Date().toISOString()
  },
  {
    title: "Join Official Telegram Channel",
    link: "https://t.me/+jZc6SmG7UgM5ZGZl",
    platform: "Telegram",
    createdAt: new Date().toISOString()
  },
  {
    title: "Follow Facebook Page",
    link: "https://www.facebook.com/share/19AP6gYCmG/",
    platform: "Facebook",
    createdAt: new Date().toISOString()
  }
];

// 📤 Firestore-এ টাস্কগুলো সেভ করার ফাংশন
export async function seedAllTasks() {
  try {
    console.log("Adding tasks to Database...");
    for (const task of taskListToSeed) {
      await addDoc(collection(db, "tasks"), task);
      console.log(`✅ Added: ${task.title}`);
    }
    alert("🎉 সকল টাস্ক সফলভাবে ডেটাবেসে যুক্ত করা হয়েছে!");
  } catch (error) {
    console.error("Error adding tasks: ", error);
    alert("❌ Error: " + error.message);
  }
}

