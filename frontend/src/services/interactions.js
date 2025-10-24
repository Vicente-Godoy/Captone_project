import API_BASE from "../api";
import { getAuth } from "firebase/auth";

export async function likePublication(publicationId) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay usuario autenticado');
  const idToken = await user.getIdToken();

  const res = await fetch(`${API_BASE}/api/interactions/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ publicationId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'No se pudo registrar el like');
  return data; // { liked, matched, matchId }
}

export async function getMatches() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay usuario autenticado');
  const idToken = await user.getIdToken();

  const res = await fetch(`${API_BASE}/api/interactions/matches`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'No se pudieron obtener los matches');
  return data; // array
}

