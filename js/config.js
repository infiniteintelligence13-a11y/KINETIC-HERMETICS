// API base URL — update RENDER_API_URL after deploying the backend to Render
const RENDER_API_URL = 'https://kinetic-hermetics-api.onrender.com';

// Auto-detect: use Render URL on GitHub Pages, relative path on localhost
window.API_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) ? '' : RENDER_API_URL;

// Helper: authenticated fetch with optional JWT
window.apiFetch = function(path, options = {}) {
  const token = localStorage.getItem('kh_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(window.API_BASE + path, { ...options, headers });
};
