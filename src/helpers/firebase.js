import admin from "firebase-admin";
import firebaseConfig from "../firebaseConfig.json" assert { type: "json" };

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

export default admin;
