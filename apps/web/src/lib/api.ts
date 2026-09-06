import axios from 'axios';
import { getAccessToken } from '@auth0/nextjs-auth0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Base client (no auth — for public endpoints) ──────────────────────────────
export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token caching for client-side API requests ───────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getClientToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  try {
    const res = await fetch('/api/token');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.accessToken) {
      cachedToken = data.accessToken;
      tokenExpiry = Date.now() + 45 * 60 * 1000; // cache for 45 minutes
      return cachedToken;
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── Authenticated client for Client Components ───────────────────────────────
export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getClientToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Authenticated client factory (for Server Components / Route Handlers) ──────
export async function getAuthenticatedApi() {
  try {
    const { accessToken } = await getAccessToken({
      authorizationParams: { audience: process.env.AUTH0_AUDIENCE },
    });
    return axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    return api;
  }
}

// ─── Client-side helper ────────────────────────────────────────────────────────
export function createClientApi(token?: string) {
  return axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}
