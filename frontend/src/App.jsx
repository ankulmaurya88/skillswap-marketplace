import { Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route path="*" element={<h2>404 — Page Not Found</h2>} />
    </Routes>
  );
}



// import AuthPage from "./pages/AuthPage";

// function App() {
//   return <AuthPage />;
// }

// export default App;













// import { useEffect, useState } from "react";
// import api from "./services/api";

// export default function App() {
//   const [status, setStatus] = useState("Checking...");

//   useEffect(() => {
//     api.get("/health/")
//       .then((response) => {
//         setStatus(response.data.status);
//       })
//       .catch(() => {
//         setStatus("Backend unavailable");
//       });
//   }, []);

//   return (
//     <main>
//       <h1>SkillSwap Marketplace</h1>
//       <p>Backend status: {status}</p>
//     </main>
//   );
// }