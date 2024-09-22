import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./routers/user.router.js";
import { taskRouter } from "./routers/task.router.js";
import path from "path"; // Add this import
import admin from "firebase-admin";
import serviceAccount from "./firebaseConfig.json" assert { type: "json" };

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Update this route to use __dirname
app.get("/firebase-messaging-sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(__dirname, "../public/firebase-messaging-sw.js"));
});

//user routers
app.get("/", (req, res) => {
  res.send("welcome!");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);

export { app };
