import api from "./api";

export const getMyProfile = async () => {
  const response = await api.get("profile/me/");
  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await api.patch("profile/me/", data);
  return response.data;
};

export const getPublicProfile = async (userId) => {
  const response = await api.get(`profile/users/${userId}/`);
  return response.data;
};