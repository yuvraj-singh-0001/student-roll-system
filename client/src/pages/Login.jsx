import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await loginUser(form);

      if (!res || !res.success) {
        setMsg(res?.message || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ SAVE AUTH DATA
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.user.id);
      localStorage.setItem("isPaid", res.user.isPaid);

      // ✅ REDIRECT LOGIC (MAIN FIX)
      if (res.user.isPaid) {
        navigate("/student");     // already paid
      } else {
        navigate("/payment");     // payment required
      }

    } catch (error) {
      setMsg("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xl">🔐</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Student Login
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to continue
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {msg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {msg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="student@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline"
            >
              Create new account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-between text-sm">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Home
          </button>
          <button
            onClick={() => navigate("/student")}
            className="text-blue-600 hover:text-blue-800"
          >
            Student Portal →
          </button>
        </div>
      </div>
    </div>
  );
}
