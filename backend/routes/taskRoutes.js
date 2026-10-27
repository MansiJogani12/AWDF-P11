const express = require("express"); 
const Task = require("../models/Task"); 
const authMiddleware = require("../middleware/authMiddleware"); 
const validateTask = require("../middleware/validateTask"); 
const cache = require("../cache");
const taskEvents = require("../events"); 
 
const router = express.Router(); 
 
router.use(authMiddleware); 
 
// ========================================== 
// CACHE STATISTICS 
// ========================================== 
 
let cacheHits = 0; 
let cacheMisses = 0; 
 
// ========================================== 
// GET ALL TASKS 
// GET /tasks 
// ========================================== 
 
// router.get("/", async (req, res) => { 
//   try { 
//     const cachedTasks = cache.get("all_tasks"); 
 
//     // CACHE HIT 
//     if (cachedTasks) { 
//       cacheHits++; 
 
//       console.log("CACHE HIT: /tasks"); 
 
//       return res.status(200).json(cachedTasks); 
//     } 
 
//     // CACHE MISS 
//     cacheMisses++; 
 
//     console.log("CACHE MISS: /tasks"); 
 
//     const tasks = await Task.find().sort({ 
//       createdAt: -1 
//     }); 
 
//     // Store result in cache 
//     cache.set("all_tasks", tasks); 
 
//     res.status(200).json(tasks); 
 
//   } catch (error) { 
//     res.status(500).json({ 
//       message: "Failed to fetch tasks", 
//       error: error.message 
//     }); 
//   } 
// }); 

router.get("/", async (req, res) => {
  try {
    // CACHE TEMPORARILY DISABLED

    /*
    const cachedTasks = cache.get("all_tasks");

    // CACHE HIT
    if (cachedTasks) {
      cacheHits++;

      console.log("CACHE HIT: /tasks");

      return res.status(200).json(cachedTasks);
    }
    */

    // CACHE MISS
    cacheMisses++;

    console.log("CACHE DISABLED: /tasks");

    const tasks = await Task.find().sort({
      createdAt: -1
    });

    // Store result in cache
    // cache.set("all_tasks", tasks);

    res.status(200).json(tasks);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
});
 
// ========================================== 
// GET SINGLE TASK 
// GET /tasks/:id 
// ========================================== 
 
router.get("/:id", async (req, res) => { 
  try { 
 
    const cacheKey = `task_${req.params.id}`; 
 
    const cachedTask = cache.get(cacheKey); 
 
    // CACHE HIT 
    if (cachedTask) { 
 
      cacheHits++; 
 
      console.log(`CACHE HIT: ${cacheKey}`); 
 
      return res.status(200).json(cachedTask); 
    } 
 
    // CACHE MISS 
    cacheMisses++; 
 
    console.log(`CACHE MISS: ${cacheKey}`); 
 
    const task = await Task.findById(req.params.id); 
 
    if (!task) { 
      return res.status(404).json({ 
        message: "Task not found" 
      }); 
    } 
 
    // Store single task 
    cache.set(cacheKey, task); 
 
    res.status(200).json(task); 
 
  } catch (error) { 
 
    res.status(500).json({ 
      message: "Failed to fetch task", 
      error: error.message 
    }); 
 
  } 
}); 
 
// ========================================== 
// CREATE TASK 
// POST /tasks 
// ========================================== 
 
router.post("/", validateTask, async (req, res) => { 
  try { 
 
    const { 
      title, 
      description, 
      completed 
    } = req.body; 
 
    const task = await Task.create({ 
      title: title, 
      description: description || "", 
      completed: 
        completed !== undefined 
          ? completed 
          : false 
    }); 
 
    // IMPORTANT: 
    // Invalidate all-tasks cache 
    cache.del("all_tasks"); 
 
    console.log("CACHE INVALIDATED: all_tasks"); 
 
    console.log(`[API] Sending 201 response at ${new Date().toISOString()}`);
    res.status(201).json(task);

    // Emit only after sending the response. The listener schedules its
    // simulated slow work with setTimeout, so it does not block this route.
    const assignedUser =
      req.user?.userId || req.user?._id || req.user?.id || req.user?.email || "unknown";
    taskEvents.emit("task-created", { task: task.toObject(), assignedUser }); 
 
  } catch (error) { 
 
    res.status(500).json({ 
      message: "Failed to create task", 
      error: error.message 
    }); 
 
  } 
}); 
 
// ========================================== 
// UPDATE TASK 
// PUT /tasks/:id 
// ========================================== 
 
router.put("/:id", validateTask, async (req, res) => { 
  try { 
 
    const { 
      title, 
      description, 
      completed 
    } = req.body; 
 
    const updatedTask = 
      await Task.findByIdAndUpdate( 
        req.params.id, 
        { 
          title: title, 
          description: description || "", 
          completed: 
            completed !== undefined 
              ? completed 
              : false 
        }, 
        { 
          new: true, 
          runValidators: true 
        } 
      ); 
 
    if (!updatedTask) { 
      return res.status(404).json({ 
        message: "Task not found" 
      }); 
    } 
 
    // Invalidate caches 
    cache.del("all_tasks"); 
    cache.del(`task_${req.params.id}`); 
 
    console.log( 
      `CACHE INVALIDATED: all_tasks and task_${req.params.id}` 
    ); 
 
    res.status(200).json(updatedTask); 
 
  } catch (error) { 
 
    res.status(500).json({ 
      message: "Failed to update task", 
      error: error.message 
    }); 
 
  } 
}); 
 
// ========================================== 
// DELETE TASK 
// DELETE /tasks/:id 
// ========================================== 
 
router.delete("/:id", async (req, res) => { 
  try { 
 
    const deletedTask = 
      await Task.findByIdAndDelete(req.params.id); 
 
    if (!deletedTask) { 
      return res.status(404).json({ 
        message: "Task not found" 
      }); 
    } 
 
    // Invalidate caches 
    cache.del("all_tasks"); 
    cache.del(`task_${req.params.id}`); 
 
    console.log( 
      `CACHE INVALIDATED: all_tasks and task_${req.params.id}` 
    ); 
 
    res.status(200).json({ 
      message: "Task deleted successfully" 
    }); 
 
  } catch (error) { 
 
    res.status(500).json({ 
      message: "Failed to delete task", 
      error: error.message 
    }); 
 
  } 
}); 
 
// ========================================== 
// CACHE DEBUG ENDPOINT 
// GET /tasks/cache/stats 
// ========================================== 
 
router.get("/cache/stats", (req, res) => { 
 
  res.status(200).json({ 
    cacheHits: cacheHits, 
    cacheMisses: cacheMisses, 
    totalRequests: cacheHits + cacheMisses 
  }); 
 
}); 
 
module.exports = router;