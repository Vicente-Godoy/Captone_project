// src/services/auth.js
import API_BASE from "../api";

export async function registerUser({ nombre, email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || data.message || "No se pudo registrar.");
    }
    // data esperado: { message, uid }
    return data;
}
