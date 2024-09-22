import admin from "./firebase.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Correct path to firebaseConfig.json
const serviceAccountPath = join(__dirname, "../firebaseConfig.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const registerToken = async (userId, token) => {
  try {
    // Assuming you're using Firestore. Adjust this if you're using a different database.
    await admin.firestore().collection("users").doc(userId).update({
      fcmToken: token,
    });
    console.log("Token registered successfully");
  } catch (error) {
    console.error("Error registering token:", error);
  }
};

export const sendTaskNotification = async (token, title, body) => {
  try {
    const message = {
      notification: { title, body },
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
