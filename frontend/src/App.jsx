import { Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import MySkillsPage from "./pages/MySkillsPage";
import DiscoverPage from "./pages/DiscoverPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import SendExchangePage from "./pages/SendExchangePage";
import ExchangesPage from "./pages/ExchangesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/skills" element={<MySkillsPage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route path="/discover" element={<DiscoverPage />} />

      <Route path="/users/:userId" element={<PublicProfilePage />} />

      <Route path="/exchanges" element={<ExchangesPage />} />
      
    <Route path="/exchanges/new/:userId" element={<SendExchangePage />}/>

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