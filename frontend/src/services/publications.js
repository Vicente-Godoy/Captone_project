// services/publications.js
import API_BASE from "../api"; // ya tienes esto
// Si usas Firebase Client SDK:
import { getAuth } from "firebase/auth";

export async function getFeed() {
    const res = await fetch(`${API_BASE}/api/publications`);
    if (!res.ok) throw new Error("No se pudo obtener el feed");
    return res.json();
}

export async function getPublicationById(id) {
    const res = await fetch(`${API_BASE}/api/publications/${id}`);
    if (!res.ok) throw new Error("No se pudo obtener la publicación");
    return res.json();
}

export async function createPublication(body) {
    // body = { tipo, titulo, descripcion, nivel, modalidad, ciudad, region, tags }
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado");
    const idToken = await user.getIdToken();

    const res = await fetch(`${API_BASE}/api/publications`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "No se pudo crear la publicación");
    return data; // { message, id }
}
