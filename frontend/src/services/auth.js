// src/services/auth.js
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import API_BASE from "../api";

/** helper: crea/actualiza el perfil del usuario en tu backend */
async function bootstrapMyProfile(idToken, { nombre, fotoUrl = null } = {}) {
    try {
        await fetch(`${API_BASE}/api/users/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ nombre, fotoUrl }),
        });
    } catch (e) {
        // No bloquees el flujo por esto, pero déjalo visible
        console.warn("bootstrapMyProfile falló:", e);
    }
}

/**
 * Login con email y password (Firebase Web SDK).
 * Guarda el idToken en localStorage para que el backend lo pueda validar si hace falta.
 * De paso, asegura que el perfil exista en Firestore (bootstrap).
 */
export async function loginWithPassword(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    localStorage.setItem("idToken", idToken);

    // Asegura el doc /users/{uid} (idempotente)
    await bootstrapMyProfile(idToken, { nombre: cred.user.displayName ?? "Usuario" });

    return cred.user;
}

/**
 * Registro de usuario en Firebase Auth.
 * Después de crear el user, llama a tu backend para crear/actualizar el perfil.
 */
export async function registerUser({ nombre, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    localStorage.setItem("idToken", idToken);

    // Crea/actualiza el perfil en tu backend (Firestore: /users/{uid})
    await bootstrapMyProfile(idToken, { nombre });

    return cred.user;
}

export async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(/* forceRefresh? false */);
}

/** Logout: limpia sesión e idToken local */
export async function logoutUser() {
    localStorage.removeItem("idToken");
    await signOut(auth);
}

/** Listener de cambios de sesión (útil si quieres reaccionar en App) */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}
