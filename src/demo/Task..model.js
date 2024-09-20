const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  priority: String,
  status: String,
  assignee: String,
});

module.exports = mongoose.model("Task", taskSchema);
