// services/publications.js
import API_BASE from "../api";
import { getAuth } from "firebase/auth";
import { fetchWithRetry, formatApiError } from "../utils/errorHandler";

const FEED_CACHE_TTL_MS = 30 * 1000;
let cachedFeed = {
  payload: null,
  expiresAt: 0,
};

const buildPublicationsUrl = ({ cursor, limit }) => {
  const url = new URL(`${API_BASE}/api/publications`);
  if (limit) {
    url.searchParams.set("limit", String(limit));
  }
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }
  return url.toString();
};

export async function getFeed(options = {}) {
  return fetchPublications(options);
}

export async function getPublicationById(id) {
  try {
    const data = await fetchWithRetry(`${API_BASE}/api/publications/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return data;
  } catch (error) {
    const formatted = formatApiError(error);
    throw new Error(formatted.message);
  }
}

export async function createPublication(body) {
  // body = { title, content, imageUrl? } o { tipo, titulo, descripcion, nivel, modalidad, ciudad, region, tags }
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario autenticado");
  }

  console.log("[CREATE PUBLICATION] Frontend request:", body);

  try {
    const idToken = await user.getIdToken();

    const data = await fetchWithRetry(`${API_BASE}/api/publications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
      maxRetries: 2 // Menos reintentos para POST (no idempotente)
    });

    console.log("[CREATE PUBLICATION] Success:", data);
    invalidateFeedCache();
    return data; // { message, id, title }
  } catch (error) {
    const formatted = formatApiError(error);
    console.error("[CREATE PUBLICATION] Backend error:", formatted);
    throw new Error(formatted.message);
  }
}

export async function fetchPublications({ cursor = null, limit = 20, force = false } = {}) {
  const canServeFromCache =
    !force &&
    !cursor &&
    cachedFeed.payload &&
    cachedFeed.expiresAt > Date.now();

  if (canServeFromCache) {
    return { ...cachedFeed.payload, fromCache: true };
  }

  try {
    const payload = await fetchWithRetry(
      buildPublicationsUrl({ cursor, limit }),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!cursor) {
      cachedFeed = {
        payload,
        expiresAt: Date.now() + FEED_CACHE_TTL_MS,
      };
    }

    return payload;
  } catch (error) {
    const formatted = formatApiError(error);
    throw new Error(formatted.message);
  }
}

export function invalidateFeedCache() {
  cachedFeed = { payload: null, expiresAt: 0 };
}
