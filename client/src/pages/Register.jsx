import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerFormA } from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    class: ""
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const storeFormA = () => {
    localStorage.setItem("formAName", String(form.name || "").trim());
    localStorage.setItem("formAMobile", String(form.mobile || "").trim());
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await registerFormA(form); // backend /api/auth/register

      if (!res.success) {
        setMsg(res.message);
        setLoading(false);
        return;
      }

      storeFormA();
      setMsg("Form A submitted successfully. Proceed to payment.");

      // cookie already set by backend
      setTimeout(() => navigate("/payment"), 800);

    } catch (error) {
      const status = error?.response?.status;
      const apiMsg = error?.response?.data?.message;
      if (status === 409) {
        storeFormA();
        setMsg(apiMsg || "Already registered. Redirecting to payment...");
        setTimeout(() => navigate("/payment"), 800);
      } else {
        setMsg(apiMsg || "Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200">

        <div className="px-6 py-5 border-b border-gray-200 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Form A Registration
          </h2>
        </div>

        <div className="px-6 py-5">

          {msg && (
            <div className="mb-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              {msg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">

            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />

            <input
              type="text"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />

            <input
              type="text"
              placeholder="Class"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-md"
            >
              {loading ? "Submitting..." : "Submit & Proceed to Payment"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
