const express = require("express");
const {
  getTasks,
  importTasks,
  exportTasks,
} = require("../controllers/taskController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", getTasks);
router.post("/import", upload.single("file"), importTasks);
router.get("/export", exportTasks);

module.exports = router;
