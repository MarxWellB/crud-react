import { useEffect, useState } from "react";
import Login from "./Login";

// URL base (defínela en .env: VITE_API_URL=http://localhost:4000/api)
const API = import.meta.env.VITE_API_URL;

// headers con token
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function App() {
  // estado principal
  const [users, setUsers] = useState([]);
  const [ui, setUi] = useState({ loading: true, error: "" });
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null); // aquí guardaremos _id de Mongo
  const [filter, setFilter] = useState("");
  const hasToken = !!localStorage.getItem("token");

  // helpers para estado
  const setLoading = (loading) => setUi((u) => ({ ...u, loading }));
  const setError = (msg) => setUi((u) => ({ ...u, error: msg || "" }));

  // ===== READ (GET /api/users) =====
  const fetchUsers = async () => {
    if (!hasToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // data viene con _id; lo dejamos tal cual
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[FETCH] error:", e);
      setError("No se pudo cargar la API.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  // ===== CREATE (POST /api/users) =====
  const createUser = async (payload) => {
    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload), // { name, email, password? }
    });
    if (!res.ok) throw new Error(`Crear: HTTP ${res.status}`);
    const created = await res.json(); // backend devuelve { id: ..., name, email }
    const _id = created._id || created.id; // por si viene como id
    setUsers((prev) => [{ _id, ...created }, ...prev]);
  };

  // ===== UPDATE (PUT /api/users/:id) =====
  const updateUser = async (id, payload) => {
    // update optimista
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...payload } : u)));
    const res = await fetch(`${API}/users/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload), // { name, role? }
    });
    if (!res.ok) {
      setError("No se pudo actualizar en el servidor.");
      console.warn("[UPDATE] status", res.status);
    } else {
      const updated = await res.json();
      // asegurar sincronía con backend
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
    }
  };

  // ===== DELETE (DELETE /api/users/:id) =====
  const deleteUser = async (id) => {
    const prev = users;
    setUsers((p) => p.filter((u) => u._id !== id)); // optimista
    const res = await fetch(`${API}/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      setUsers(prev); // revertir
      setError("No se pudo eliminar en el servidor.");
      console.warn("[DELETE] status", res.status);
    }
  };

  // ===== SUBMIT (crear / editar) =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) return setError("Nombre y email son obligatorios.");

    try {
      if (editingId) {
        await updateUser(editingId, { name });
        setEditingId(null);
      } else {
        await createUser({ name, email });
      }
      setForm({ name: "", email: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("[SUBMIT] error:", err);
      setError("No se pudo completar la acción.");
    }
  };

  const onEdit = (u) => {
    setEditingId(u._id);
    setForm({ name: u.name || "", email: u.email || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onCancel = () => {
    setEditingId(null);
    setForm({ name: "", email: "" });
    setError("");
  };

  // filtro
  const filtered = users.filter((u) => {
    const q = filter.toLowerCase();
    return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  // Si no hay token, mostramos Login
  if (!hasToken) {
    return <Login onLoggedIn={() => window.location.reload()} />;
  }

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b sticky top-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <h1 className="text-2xl font-bold">CRUD de Usuarios (React + API)</h1>
          <div className="flex-1" />
          <input
            className="border rounded-lg px-3 py-2 w-full md:w-72"
            placeholder="Buscar por nombre o email…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button
            onClick={fetchUsers}
            className="px-4 py-2 rounded-lg bg-black text-white"
            title="Recargar desde API"
          >
            Recargar
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg border"
            title="Cerrar sesión"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Mensajes */}
        {ui.error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {ui.error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">
            {editingId ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={!!editingId} // no editar email al actualizar
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              {editingId ? "Guardar cambios" : "Crear"}
            </button>
            {editingId && (
              <button type="button" className="px-4 py-2 rounded-lg border" onClick={onCancel}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Estado de carga */}
        {ui.loading && <div className="mt-6 text-gray-600">Cargando usuarios…</div>}

        {/* Lista */}
        {!ui.loading && (
          <section className="mt-6 grid gap-3">
            {filtered.length === 0 ? (
              <div className="text-gray-500">Sin resultados.</div>
            ) : (
              filtered.map((u) => (
                <article key={u._id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-sm text-gray-600">{u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(u)} className="px-3 py-1 rounded-lg border">
                      Editar
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}
