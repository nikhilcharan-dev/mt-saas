import { useState, useEffect } from "react";
import { login } from "../auth/authService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();

  // ✅ REQUIRED STATE
  const [form, setForm] = useState({
    email: "",
    password: "",
    tenantSubdomain: "",
  });

  const [error, setError] = useState("");

  // 🔥 Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(form);
      loginUser(res.data);        // save token + user
      navigate("/dashboard");     // ✅ redirect
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="tenantSubdomain"
          placeholder="Tenant Subdomain (demo)"
          value={form.tenantSubdomain}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;





// import { useState, useEffect } from "react";
// import { login } from "../auth/authService";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const { loginUser, user } = useAuth();
//   const navigate = useNavigate();

// //   const [form, setForm] = useState({
// //     email: "",
// //     password: "",
// //     tenantSubdomain: "",
// //   });

// //   const [error, setError] = useState("");

//   // 🔥 Redirect if already logged in
//   useEffect(() => {
//     if (user) {
//       navigate("/dashboard");
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await login(form);
//       loginUser(res.data);   // saves token + user
//       navigate("/dashboard"); // ✅ REDIRECT
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "80px auto" }}>
//       <h2>Login</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       <form onSubmit={handleSubmit}>
//         <input name="email" placeholder="Email" onChange={handleChange} />
//         <br /><br />
//         <input type="password" name="password" placeholder="Password" onChange={handleChange} />
//         <br /><br />
//         <input name="tenantSubdomain" placeholder="Tenant Subdomain" onChange={handleChange} />
//         <br /><br />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;
