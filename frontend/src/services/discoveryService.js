import api from "./api";

export const discoverUsers = async (params = {}) => {
  const response = await api.get("skills/discover/", {
    params,
  });

  return response.data;
};

export const getPublicProfile = async (userId) => {
  const response = await api.get(
    `profile/users/${userId}/`
  );

  return response.data;
};