import { useEffect, useState } from "react";
import { getProjects } from "../../api/projectService.js";

const UserDashboard = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h3>👤 My Projects</h3>

      {projects.map((p) => (
        <p key={p.id}>{p.name}</p>
      ))}
    </div>
  );
};

export default UserDashboard;
