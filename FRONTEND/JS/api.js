/* ── KAPITBISIG API CLIENT ── */
const API_BASE = '/api';

async function apiFetch(endpoint, options = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  const res = await fetch(API_BASE + endpoint, Object.assign({}, defaults, options));
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

// Campaign endpoints
const CampaignAPI = {
  getAll:    (params) => apiFetch('/campaigns?' + new URLSearchParams(params)),
  getById:   (id)     => apiFetch('/campaigns/' + id),
  donate:    (id, data) => apiFetch('/campaigns/' + id + '/donate', { method: 'POST', body: JSON.stringify(data) }),
};

// Auth endpoints
const AuthAPI = {
  signIn:  (data) => apiFetch('/auth/signin',  { method: 'POST', body: JSON.stringify(data) }),
  signUp:  (data) => apiFetch('/auth/signup',  { method: 'POST', body: JSON.stringify(data) }),
  signOut: ()     => apiFetch('/auth/signout', { method: 'POST' }),
};