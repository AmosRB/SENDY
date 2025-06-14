// lib/api.js

const apiBase = process.env.NEXT_PUBLIC_API_URL;

/**
 * Wrapper around fetch for calling backend API
 * Adds full URL, handles errors, and auto-parses JSON
 */
export async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${apiBase}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      const message = data?.error || res.statusText || 'Unknown error';
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error(`❌ API fetch error [${path}]:`, err.message);
    throw err;
  }
}
