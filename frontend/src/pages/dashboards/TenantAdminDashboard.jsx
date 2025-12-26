import { useEffect, useState } from "react";
import { getProjects } from "../../api/projectService.js";
import ProjectTasks from "../../components/ProjectTasks.jsx";
import CreateProject from "../../components/CreateProject.jsx";

const TenantAdminDashboard = () => {
  const [projects, setProjects] = useState([]);

  const loadProjects = () => {
    getProjects()
      .then((res) => {
        setProjects(res.data.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div>
      <h3>🏢 Tenant Admin Projects</h3>

      {/* ✅ CREATE PROJECT */}
      <CreateProject onCreated={loadProjects} />

      <hr />

      {/* ✅ LIST PROJECTS */}
      {projects.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h4>{p.name}</h4>
          <p>{p.description}</p>

          {/* ✅ TASKS PER PROJECT */}
          <ProjectTasks projectId={p.id} />
        </div>
      ))}
    </div>
  );
};

export default TenantAdminDashboard;
