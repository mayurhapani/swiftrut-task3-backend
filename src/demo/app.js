const express = require("express");
const mongoose = require("mongoose");
const taskRoutes = require("./routes/taskRoutes");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect("mongodb://localhost:27017/taskmanager", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected...");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
