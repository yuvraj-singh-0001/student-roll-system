// imports same
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerFormA } from "../api";
import Navbar from "../components/layout/Navbar";

export default function Home() {
  const navigate = useNavigate();

  const [activeFeature, setActiveFeature] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    class: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: "🔒", title: "Secure Testing", desc: "Advanced proctoring & anti-cheating" },
    { icon: "📊", title: "AI Analytics", desc: "Real-time performance insights" },
    { icon: "⚡", title: "Fast Results", desc: "Instant grading & reporting" },
    { icon: "📱", title: "Any Device", desc: "Fully responsive on all screens" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openCard = () => {
    setLoginOpen(true);
    setMsg("");
  };

  const closeCard = () => {
    setLoginOpen(false);
    setMsg("");
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.class) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await registerFormA(form);

      if (!res.success) {
        setMsg(res.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("formAName", String(form.name || "").trim());
      localStorage.setItem("formAMobile", String(form.mobile || "").trim());
      setMsg("Form A submitted successfully. Redirecting to payment...");

      setTimeout(() => {
        navigate("/payment");
      }, 800);

    } catch (error) {
      const status = error?.response?.status;
      const apiMsg = error?.response?.data?.message;
      if (status === 409) {
        localStorage.setItem("formAName", String(form.name || "").trim());
        localStorage.setItem("formAMobile", String(form.mobile || "").trim());
        setMsg(apiMsg || "Already registered. Redirecting to payment...");
        setTimeout(() => navigate("/payment"), 800);
      } else {
        setMsg(apiMsg || "Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = () => {
    const el = document.getElementById("why-choose");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden">

      {/* Background Animation Same */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-[#FFF3C4] rounded-full mix-blend-multiply blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-[#FFE6A3] rounded-full mix-blend-multiply blur-xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        <Navbar onStudentLoginClick={openCard} />

        <main className="flex-1">

          <section
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 items-center transition-all duration-500 ${
              loginOpen
                ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
                : "lg:grid-cols-1 place-items-center"
            }`}
            style={{ minHeight: "calc(100vh - 70px)" }}
          >

            {/* LEFT SIDE SAME */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                The International Unconventional Olympaids ++
              </h1>
              <p className="text-gray-600 mb-6">
                Register now to secure your participation.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={openCard}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] rounded-xl shadow-lg"
                >
                  Register Now
                </button>

                <button
                  onClick={handleLearnMore}
                  className="px-6 py-3 bg-white border rounded-xl"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* RIGHT SIDE FORM A */}
            {loginOpen && (
              <div className="bg-white rounded-3xl shadow-2xl border p-6">

                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Form A Registration</h2>
                  <button onClick={closeCard}>✕</button>
                </div>

                {msg && (
                  <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    {msg}
                  </div>
                )}

                <form onSubmit={submitRegister} className="space-y-4">

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Class"
                    value={form.class}
                    onChange={(e) =>
                      setForm({ ...form, class: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] rounded-xl font-semibold"
                  >
                    {loading ? "Submitting..." : "Submit & Proceed to Payment"}
                  </button>

                </form>
              </div>
            )}

          </section>

        </main>
      </div>
    </div>
  );
}
