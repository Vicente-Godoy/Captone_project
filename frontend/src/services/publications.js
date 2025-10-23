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
    // body = { title, content, imageUrl? } o { tipo, titulo, descripcion, nivel, modalidad, ciudad, region, tags }
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado");

    console.log('📝 [CREATE PUBLICATION] Frontend request:', body);

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

    if (!res.ok) {
        console.error('❌ [CREATE PUBLICATION] Backend error:', data);
        throw new Error(data?.error || "No se pudo crear la publicación");
    }

    console.log('✅ [CREATE PUBLICATION] Success:', data);
    return data; // { message, id, title }
}

export async function fetchPublications() {
    const res = await fetch(`${API_BASE}/api/publications`);
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
    }
    return res.json(); // array de publicaciones
}