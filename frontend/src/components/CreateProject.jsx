import { useState } from "react";
import { createProject } from "../api/projectService.js";

const CreateProject = ({ onCreated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createProject(form);
      alert("Project created");
      setForm({ name: "", description: "" });
      onCreated(); // 🔥 refresh projects
    } catch (err) {
      alert("Failed to create project");
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Create Project</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Project name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateProject;
