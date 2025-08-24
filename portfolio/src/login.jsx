import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("demo@mail.com");
  const [password, setPassword] = useState("demo123");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Credenciales inválidas");
      const data = await res.json(); // { token }
      localStorage.setItem("token", data.token);
      onLoggedIn?.();
    } catch (e) {
      setErr("Credenciales inválidas");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 border rounded-lg mt-10 bg-white">
      <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>
      <input
        className="w-full border p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="w-full border p-2 mb-3"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {err && <p className="text-red-600 mb-2">{err}</p>}
      <button className="w-full bg-blue-600 text-white p-2 rounded">Entrar</button>
    </form>
  );
}
