import api from "./api";

export const registerUser = async (data) => {
  const response = await api.post("auth/register/", data);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post(
    "auth/login/",
    credentials
  );

  sessionStorage.setItem(
    "access_token",
    response.data.access
  );

  // Refresh token handling will be implemented later.
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("auth/me/");
  return response.data;
};

export const logoutUser = () => {
  sessionStorage.removeItem("access_token");
};