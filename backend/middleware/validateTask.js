const validateTask = (req, res, next) => {
  const { title, description, completed } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Task title is required" });
  }
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ message: "Description must be a string" });
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ message: "Completed must be true or false" });
  }

  req.body.title = title.trim();
  if (description !== undefined) {
    req.body.description = description.trim();
  }
  next();
};

module.exports = validateTask;
