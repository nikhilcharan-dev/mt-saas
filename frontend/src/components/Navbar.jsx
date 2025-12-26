import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { auth, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div style={{ padding: 10, background: "#eee" }}>
      {auth ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <span>Please login</span>
      )}
    </div>
  );
};

export default Navbar;
