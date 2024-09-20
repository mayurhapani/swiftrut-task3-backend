import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./routers/user.router.js";
import { taskRouter } from "./routers/task.router.js";
import admin from "firebase-admin";

// Firebase Admin SDK configuration
const serviceAccount = {
  type: "service_account",
  project_id: "task-management-app-507ed",
  private_key_id: "104c229e9aad9a016fd2aecb6eec88c39fc619ca",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQcqnHEpYJ6ipX\ni/XFrI8FcuH/VBHLTerfSUF6hNJSuG1krqNwDPDkZzLUdY+cSH2TFw+42ED3Eg95\nQI9TzYPSANDfD1jSP1Wfbzj/+oFLbVU4QPRykFGVXfxCSskp5SJyLSzQvqXVce2n\n0QwAToKkJlENgrLB1XCfiZq7G6fYHp2BzgO7OHk5Xdk3Eaku2C1aWzFwqLx5XiXe\np+AQ1Mpj8GXBSYuMGTpdZtN204xmf6XqYWx9NKN6tcUx7J8ouVUxU3WnWl5ZcF5j\nDIrbzbgvsLDP24MGxz/zJ5hvCqJEEwyoLTonYfiSpI8lntHRJIScCpD9QQWJtERu\nEgiYFZPvAgMBAAECggEAH3EkTdxuWFmDgIgijuor+qDtGQP32ShMJNkacN4nEYYz\nLgwvp/+zuGgeoTCIdIT0uCKy4ulvxzTos5v64qOt3hf0aakZd0FJa46t1OLW7Oc1\ngxI9LSi6vaKbIe7A8DpZW0qYJ3aSciNIu1cLjeJJz3PeJwEPcLB+1/m8JrwRscYK\nmG27gPzfL2iD8jk046lH03/b6MYivlZuX1z/EV8gdYG4Jro2hl8ag9ga72rzpE3P\nWeKLlFouxYK+RmioUgq6GhR+p6npMgzjMkXg0U6RPEWARIwnXtup3IPnUcP3WQ6E\n0mQzoojSrNh2sQaM7M9xv2m2dfmDQ6izHiTKfHanTQKBgQD3CZECi01oElj+Zpwy\nP9UKdTQUmb2or4LG79xocXftNRKYzfjWTv+bgPSWJKLHxXmJNhIRF6UynNg4eVG5\nIi25xCBO1GXfR+4Ps+oZiTrN2viNPSq7UdG2wO2dBhI9l0sNFteLqfYltXKMKKdC\n+8zBEcaudIJLZ0wGveJJmFCqJQKBgQDYAq9+sF5ADoQCqbAUE733kCE16rcJrTX6\nMA6ySBLROnajQikk/i5hKf2A9lAGDMfQZSxEpjeVcMNVw8f6eojbvtyqBk5ftW6K\nu+ZLsKv+uoZ7O0DEUGo+7u1y/uqqSL8X0na84dymPW+oSS/o+ESFblY5EADSXnzw\nJSnWnDGHgwKBgC1ecGdLNhga5oUySxVfa7zT8ZCm+5HzSc1HV+9Gh4Pk71lo2n5h\nW8gvUrwQVmTh+4Qbjg3djdVRwNP+U+fwQv2O63AOyfbLuwjfPesarNYJlQQ7a5Gj\nYSRzIjBoYQk2s+3feA6KVE5wmGztOmqu29fJb/eyJgu7GNdUIC7r7kSRAoGBAK74\nzesTNeUxXOFDTmuU6kYEK8Ke05E1CwoTr3PeSc/NSZhI2Ucr1anC96Nk4cFkzN4T\ndd5NvayBYNix8+UDKKTHX7shzI5eSqJ6PbuF6mw17wUXJAlhEg7UPubtcmxo7NGB\nG8k4MyE9lpp8XiCaKfbjP1iNi/zbqNxlXhSHBN+9AoGBAPBwF8KxxBcp8eahjJCc\nSaqHWAj2tj0znc0FtRILdJfcmRo9rGx1i6Tkx9jODYodMV6B/caRhKrxyRuTzkGW\nOALID+6zEWygrOK2cXqU4yfWhd3tjYb31Zqt6LN9Gi2Zz0Ki3SOJDnHqDSOMigr3\nQEl6M/cMId0j3j40iFI42nMy\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-xzl3y@task-management-app-507ed.iam.gserviceaccount.com",
  client_id: "106108684023342947049",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xzl3y%40task-management-app-507ed.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

//user routers
app.get("/", (req, res) => {
  res.send("welcome!");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);

export { app };
