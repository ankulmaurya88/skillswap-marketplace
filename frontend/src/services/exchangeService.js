import api from "./api";

export async function getUserOffers(userId) {
  const { data } = await api.get(
    `skills/users/${userId}/`
  );
  return data;
}

export async function createExchange(payload) {
  const { data } = await api.post(
    "exchanges/",
    payload
  );
  return data;
}

export async function getExchanges(direction = "all") {
  const { data } = await api.get(
    "exchanges/",
    { params: { direction } }
  );
  return data;
}

export async function changeExchangeStatus(id, status) {
  const { data } = await api.patch(
    `exchanges/${id}/status/`,
    { status }
  );
  return data;
}