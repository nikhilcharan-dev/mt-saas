import { useEffect, useState } from "react";
import { getTasks, createTask } from "../api/taskService.js";

const ProjectTasks = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    const res = await getTasks(projectId);
    setTasks(res.data.data);
  };

  const handleAddTask = async () => {
    await createTask(projectId, { title, priority: "high" });
    setTitle("");
    fetchTasks();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Tasks</h4>

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>

      <input
        placeholder="New Task"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handleAddTask}>Add Task</button>
    </div>
  );
};

export default ProjectTasks;
