import { useEffect, useState } from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from "../api";

function Home() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        logout();
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const handleExpiredToken = () => {
      logout();
      setError("Your session expired. Please login again.");
    };

    window.addEventListener("auth-expired", handleExpiredToken);

    return () => {
      window.removeEventListener("auth-expired", handleExpiredToken);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const data = await getTasks();

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "register") {
        await registerUser(email, password);

        setMessage("Registration successful. Please login.");

        setAuthMode("login");
        setPassword("");
      } else {
        const data = await loginUser(email, password);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);

        setMessage("Login successful");

        setPassword("");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setCreating(true);

    try {
      const newTask = await createTask(title, description);

      setTasks((prev) => [newTask, ...prev]);

      setTitle("");
      setDescription("");

      setMessage("Task created successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (task) => {
    setError("");

    try {
      const updatedTask = await updateTask(task._id, {
        ...task,
        completed: !task.completed
      });

      setTasks((prev) =>
        prev.map((t) =>
          t._id === updatedTask._id ? updatedTask : t
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleSaveEdit = async (task) => {
    setError("");
    setMessage("");

    if (!editTitle.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      const updatedTask = await updateTask(task._id, {
        title: editTitle,
        description: editDescription,
        completed: task.completed
      });

      setTasks((prev) =>
        prev.map((t) =>
          t._id === updatedTask._id ? updatedTask : t
        )
      );

      setEditingTaskId(null);

      setMessage("Task updated successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteTask(id);

      setTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );

      setMessage("Task deleted successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setTasks([]);

    setEmail("");
    setPassword("");
  };

  if (!user) {
    return (
      <div className="container">

        <div className="auth-card">

          <h1>Task Manager</h1>

          <h2>
            {authMode === "login"
              ? "Login"
              : "Register"}
          </h2>

          {message && (
            <div className="success">
              {message}
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth}>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                ? "Login"
                : "Register"}
            </button>

          </form>

          <button
            className="secondary-button"
            onClick={() => {
              setAuthMode(
                authMode === "login"
                  ? "register"
                  : "login"
              );

              setError("");
              setMessage("");
            }}
          >
            {authMode === "login"
              ? "New User? Register"
              : "Already Registered? Login"}
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="container">

      <div className="header">

        <div>
          <h1>Task Manager</h1>

          <p>
            Logged in as:{" "}
            <strong>{user.email}</strong>
          </p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </div>

      {message && (
        <div className="success">
          {message}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="task-form">

        <h2>Add New Task</h2>

        <form onSubmit={handleCreateTask}>

          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={creating}
          >
            {creating
              ? "Adding..."
              : "Add Task"}
          </button>

        </form>

      </div>

      <h2>My Tasks</h2>

      {loading && (
        <p>Loading tasks...</p>
      )}

      {!loading && tasks.length === 0 && (
        <p>No tasks found.</p>
      )}

      <div className="task-list">

        {tasks.map((task) => (

          <div
            className="task-card"
            key={task._id}
          >

            {editingTaskId === task._id ? (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >

                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) =>
                    setEditTitle(e.target.value)
                  }
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />

                <textarea
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(e.target.value)
                  }
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    minHeight: "60px"
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px"
                  }}
                >

                  <button
                    onClick={() =>
                      handleSaveEdit(task)
                    }
                  >
                    Save
                  </button>

                  <button
                    className="secondary-button"
                    onClick={cancelEditing}
                    style={{
                      background: "#6c757d",
                      color: "white"
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </div>

            ) : (

              <>

                <h3>{task.title}</h3>

                <p>{task.description}</p>

                <p>
                  Status:{" "}
                  <strong>
                    {task.completed
                      ? "Completed"
                      : "Pending"}
                  </strong>
                </p>

                <button
                  onClick={() =>
                    startEditing(task)
                  }
                  style={{
                    marginRight: "8px"
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleToggleTask(task)
                  }
                  style={{
                    marginRight: "8px"
                  }}
                >
                  {task.completed
                    ? "Mark Pending"
                    : "Mark Completed"}
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    handleDeleteTask(task._id)
                  }
                >
                  Delete
                </button>

              </>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}

export default Home;