const Task = require("../models/Task");
const csvParser = require("csv-parser");
const fs = require("fs");
const json2csv = require("json2csv").parse;
const path = require("path");

exports.getTasks = async (req, res) => {
  const { page, filters } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  let query = {};

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  try {
    const tasks = await Task.find(query).skip(skip).limit(limit);
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.importTasks = (req, res) => {
  const filePath = path.join(__dirname, `../uploads/${req.file.filename}`);
  const tasks = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      tasks.push(row);
    })
    .on("end", async () => {
      await Task.insertMany(tasks);
      res.status(200).json({ message: "Tasks imported successfully" });
    })
    .on("error", (err) => {
      res.status(500).json({ message: "CSV Parsing Error" });
    });
};

exports.exportTasks = async (req, res) => {
  try {
    const tasks = await Task.find({});
    const csv = json2csv(tasks);
    res.header("Content-Type", "text/csv");
    res.attachment("tasks.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Error exporting tasks" });
  }
};
