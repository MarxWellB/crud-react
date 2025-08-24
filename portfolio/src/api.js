const API = import.meta.env.VITE_API_URL; // p.ej. http://localhost:4000/api

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login inválido');
  const data = await res.json(); // { token }
  localStorage.setItem('token', data.token);
  return data.token;
}

export async function getUsers() {
  const res = await fetch(`${API}/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al listar usuarios');
  return res.json();
}

export async function createUser(payload) {
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload), // {name, email, password?}
  });
  if (!res.ok) throw new Error('Error al crear usuario');
  return res.json();
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload), // {name, role?}
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return true;
}
