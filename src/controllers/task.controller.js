import { taskModel } from "../models/task.model.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTaskNotification } from "..//helpers/firebaseAdmin.js";

//new
import path from "path";
import fastCsv from "fast-csv";
import { fileURLToPath } from "url";
import { readCSVFile, deleteFile } from "../helpers/fileHelper.js";
// import { parse as json2csv } from "json2csv";

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addTask = asyncHandler(async (req, res) => {
  const { title, description, category, assignTo } = req.body;
  const userId = req.user._id;

  //validation error
  if ([title, description].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const newTask = await taskModel.create({
    title,
    description,
    category,
    createdBy: userId,
    assignTo,
  });

  if (!newTask) {
    throw new ApiError(500, "Something went wrong while adding task");
  }

  // Send notification to assigned user
  const assignedUser = await userModel.findById(assignTo);
  if (assignedUser && assignedUser.fcmToken) {
    try {
      await sendTaskNotification(
        assignedUser.fcmToken,
        "New Task Assigned",
        `You have been assigned a new task: ${title}`
      );
    } catch (error) {
      console.error("Error sending notification:", error);
      // Continue execution even if notification fails
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(200, newTask, "New Task added successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const task = await taskModel.findOne({ _id });

  if (!task) throw new ApiError(402, "Task not found");

  const deletedTask = await taskModel.findOneAndDelete({ _id });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTask, "Task deleted successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const { _id } = req.params;

  // validation error
  const task = await taskModel.findByIdAndUpdate(_id, {
    title,
    description,
    category,
  });

  if (!task) {
    throw new ApiError(402, "Post not found");
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task updated successfully"));
  }
});

const completeTask = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  // validation error
  const isTask = await taskModel.findById(_id);
  if (!isTask) {
    throw new ApiError(402, "Post not found");
  }

  //task update as completed
  const task = await taskModel.findByIdAndUpdate(
    _id,
    { isCompleted: !isTask.isCompleted },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task status updated"));
});

// const getTasks = asyncHandler(async (req, res) => {
//   const user = req.user;
//   let tasks;

//   if (user.role == "admin") {
//     tasks = await taskModel
//       .find({})
//       .populate("createdBy", "name")
//       .populate("assignTo", "name");
//   } else {
//     tasks = await taskModel
//       .find({ assignTo: req.user._id })
//       .populate("createdBy", "name")
//       .populate("assignTo", "name");
//   }

//   return res.json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
// });

const getTasks = asyncHandler(async (req, res) => {
  const { page = 1, filters = {} } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;
  let query = {};

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const user = req.user;
  let tasks;

  if (user.role == "admin") {
    tasks = await taskModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name")
      .populate("assignTo", "name");
  } else {
    tasks = await taskModel
      .find({ ...query, assignTo: req.user._id })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name")
      .populate("assignTo", "name");
  }

  return res.json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

const importTasks = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "File not found. Please upload a CSV file.");
  }

  const filePath = path.join(__dirname, `../uploads/${req.file.filename}`);

  try {
    const tasks = await readCSVFile(filePath);

    // Convert isCompleted and map user names to ObjectId
    const formattedTasks = await Promise.all(
      tasks.map(async (task) => {
        // Convert 'TRUE'/'FALSE' to boolean
        const isCompleted = task.isCompleted === "TRUE";

        // Find users by name for createdBy and assignTo fields
        const createdByUser = await userModel.findOne({ name: task.createdBy });
        const assignToUser = await userModel.findOne({ name: task.assignTo });

        if (!createdByUser || !assignToUser) {
          throw new ApiError(400, "Invalid user in createdBy or assignTo");
        }

        // Return formatted task with ObjectId references
        return {
          ...task,
          isCompleted,
          createdBy: createdByUser._id, // Replace name with ObjectId
          assignTo: assignToUser._id, // Replace name with ObjectId
          createdAt: new Date(task.createdAt), // Ensure date is valid
          updatedAt: new Date(task.updatedAt), // Ensure date is valid
        };
      })
    );

    // Insert the formatted tasks into the database
    await taskModel.insertMany(formattedTasks);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Tasks imported successfully"));
  } catch (error) {
    console.error("Error during CSV import:", error);
    throw new ApiError(500, "Error importing tasks");
  } finally {
    deleteFile(filePath); // Clean up the file after processing
  }
});

const exportTasks = asyncHandler(async (req, res) => {
  const tasks = await taskModel
    .find({})
    .populate("createdBy")
    .populate("assignTo");

  // Process the data to remove unwanted fields and ensure proper CSV format
  const csvData = [];
  tasks.forEach((task) => {
    const cleanTask = {
      title: task.title,
      description: task.description,
      category: task.category,
      createdBy: task.createdBy.name,
      assignTo: task.assignTo.name,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
    csvData.push(cleanTask);
  });

  fastCsv
    .writeToStream(res, csvData, { headers: true })
    .on("finish", () => res.end())
    .on("error", (err) => console.error(err));
});

export {
  addTask,
  deleteTask,
  updateTask,
  getTasks,
  completeTask,
  importTasks,
  exportTasks,
};
