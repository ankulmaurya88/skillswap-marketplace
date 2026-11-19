import api from "./api";

export const getSkills = async (search = "") => {
  const response = await api.get("skills/", {
    params: { search },
  });

  return response.data;
};

export const getMySkills = async () => {
  const response = await api.get("skills/mine/");
  return response.data;
};

export const addMySkill = async (data) => {
  const response = await api.post("skills/mine/", data);
  return response.data;
};

export const deleteMySkill = async (id) => {
  await api.delete(`skills/mine/${id}/`);
};