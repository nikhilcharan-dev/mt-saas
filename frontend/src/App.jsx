import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;




// // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // import Login from "./pages/Login";
// // import Dashboard from "./pages/Dashboard";
// // import { useAuth } from "./context/AuthContext";

// // const PrivateRoute = ({ children }) => {
// //   const { user } = useAuth();
// //   return user ? children : <Navigate to="/login" />;
// // };

// // function App() {
// //   return (
// //     <BrowserRouter>
// //       <Routes>
// //         <Route path="/login" element={<Login />} />
// //         <Route
// //           path="/dashboard"
// //           element={
// //             <PrivateRoute>
// //               <Dashboard />
// //             </PrivateRoute>
// //           }
// //         />
// //         <Route path="*" element={<Navigate to="/login" />} />
// //       </Routes>
// //     </BrowserRouter>
// //   );
// // }

// // export default App;
// import PrivateRoute from "./routes/PrivateRoute";
// import Dashboard from "./pages/Dashboard";
// import Login from "./pages/Login";
// import { Routes, Route } from "react-router-dom";

// function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />

//       <Route
//         path="/dashboard"
//         element={
//           <PrivateRoute>
//             <Dashboard />
//           </PrivateRoute>

//         }
//       />

//       <Route path="*" element={<Login />} />
//     </Routes>
//   );
// }

// export default App;
