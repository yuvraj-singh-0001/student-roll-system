import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await registerUser(form);
    setMsg(res.message);
    if (res.success) setTimeout(() => navigate("/login"), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-fade-in"
      >
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Create Account
        </h2>

        <input
          className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full p-3 mb-6 border rounded-xl focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition">
          Register
        </button>

        {msg && <p className="text-center text-sm mt-4 text-gray-600">{msg}</p>}
      </form>
    </div>
  );
}
