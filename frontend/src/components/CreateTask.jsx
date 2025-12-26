import { useState } from "react";
import { createTask } from "../api/taskService.js";

const CreateTask = ({ projectId, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    priority: "medium",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTask(projectId, form);
      setForm({ title: "", priority: "medium" });
      onCreated();
    } catch {
      alert("Failed to create task");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="Task title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button type="submit">Add Task</button>
    </form>
  );
};

export default CreateTask;
