
import api, { clearTokens } from "./api";

export const registerUser = async (data) => {
  const response = await api.post("auth/register/", data);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("auth/login/", credentials);

  sessionStorage.setItem("access_token", response.data.access);
  sessionStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("auth/me/");
  return response.data;
};

export const logoutUser = async () => {
  const refresh = sessionStorage.getItem("refresh_token");

  try {
    if (refresh) {
      await api.post("auth/logout/", { refresh });
    }
  } finally {
    clearTokens();
  }
};



// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import {
//   loginUser,
//   getCurrentUser,
//   logoutUser,
// } from "../services/authService";



// import { clearTokens } from "../services/api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let active = true;

//     const restoreSession = async () => {
//       try {
//         if (!sessionStorage.getItem("refresh_token")) {
//           return;
//         }

//         const currentUser = await getCurrentUser();

//         if (active) {
//           setUser(currentUser);
//         }
//       } catch {
//         clearTokens();
//       } finally {
//         if (active) setLoading(false);
//       }
//     };

//     restoreSession();

//     const handleExpired = () => setUser(null);
//     window.addEventListener("auth:expired", handleExpired);

//     // No refresh token means loading can finish immediately
//     if (!sessionStorage.getItem("refresh_token")) {
//       setLoading(false);
//     }

//     return () => {
//       active = false;
//       window.removeEventListener("auth:expired", handleExpired);
//     };
//   }, []);

//   const login = async (credentials) => {
//     await loginUser(credentials);
//     const currentUser = await getCurrentUser();
//     setUser(currentUser);
//   };

//   const logout = async () => {
//     try {
//       await logoutUser();
//     } finally {
//       setUser(null);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }} >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be inside AuthProvider");
//   }

//   return context;
// }

