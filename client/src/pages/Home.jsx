// ... imports same
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";
import Navbar from "../components/layout/Navbar";

export default function Home() {
  const navigate = useNavigate();

  const [activeFeature, setActiveFeature] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "" });

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

  const openCard = (mode = "login") => {
    setLoginOpen(true);
    setAuthMode(mode);
    setMsg("");
  };

  const closeCard = () => {
    setLoginOpen(false);
    setMsg("");
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return;
    setLoading(true);
    setMsg("");

    try {
      const res = await loginUser(loginForm);
      if (!res || !res.success) {
        setMsg(res?.message || "Login failed");
        setLoading(false);
        return;
      }
      const { user, token } = res;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("isPaid", user.isPaid);

      if (user.isPaid) navigate("/student");
      else navigate("/payment");
    } catch {
      setMsg("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) return;
    setLoading(true);
    setMsg("");

    try {
      const res = await registerUser(regForm);
      setMsg(res.message || "");

      if (res.success) {
        const { data } = res;
        if (data && data.id) {
          localStorage.setItem("userId", data.id);
          localStorage.setItem("isPaid", false);
        }
        navigate("/payment");
      }
    } catch {
      setMsg("Registration failed. Try again.");
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
      {/* Animated bg + particles same as before */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-[#FFF3C4] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-[#FFE6A3] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-[#FFEBD0] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#FFCD2C]/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar onStudentLoginClick={() => openCard("login")} />

        {/* HERO + AUTH CARD (first screen) */}
        <main className="flex-1">
          <section
            className={`
              max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
              grid gap-10 items-center
              transition-all duration-500
              ${
                loginOpen
                  ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
                  : "lg:grid-cols-1 place-items-center"
              }
            `}
            style={{ minHeight: "calc(100vh - 70px)" }}
          >
            {/* LEFT hero text */}
            <div className="transition-all duration-500 w-full justify-self-center text-center">
              <div className="mb-4 overflow-hidden">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFCD2C] via-[#E0AC00] to-[#FFB200] animate-gradient">
                    The International Unconventional
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-900 to-black mt-1">
                    Olympaids ++
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in">
                A global platform for creative minds to compete in non-traditional challenges,
                promoting critical thinking and innovation.
              </p>

              <div className="flex flex-wrap gap-3 justify-center transition-all duration-500">
                <button
                  onClick={() => openCard("login")}
                  className="group relative px-6 py-3 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 text-sm font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="text-base">🔐</span>
                    Login
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>

                <button
                  onClick={handleLearnMore}
                  className="group relative px-6 py-3 bg-white text-gray-900 text-sm font-semibold rounded-xl border border-[#FFCD2C]/70 shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 hover:bg-[#FFF3C4]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF2] to-[#FFF3C4] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="text-base">📖</span>
                    Learn More
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT auth card (same) */}
            <div
              className={`
                w-full lg:w-[360px]
                transition-all duration-500
                ${
                  loginOpen
                    ? "opacity-100 translate-y-0 max-h-[560px]"
                    : "opacity-0 -translate-y-4 max-h-0 overflow-hidden pointer-events-none"
                }
              `}
            >
              {loginOpen && (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-[#FFE6A3] p-5 sm:p-6 animate-fade-in-up">
                  {/* Tabs + close */}
                  <div className="flex items-center mb-3">
                    <div className="flex flex-1 bg-[#FFF7DA] rounded-full p-1 text-[11px] font-medium">
                      <button
                        onClick={() => {
                          setAuthMode("login");
                          setMsg("");
                        }}
                        className={`flex-1 px-2.5 py-1.5 rounded-full transition-all ${
                          authMode === "login"
                            ? "bg-white shadow text-[#E0AC00]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        🔐 Login
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode("register");
                          setMsg("");
                        }}
                        className={`flex-1 px-2.5 py-1.5 rounded-full transition-all ${
                          authMode === "register"
                            ? "bg-white shadow text-[#E0AC00]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        📝 Register
                      </button>
                    </div>
                    <button
                      onClick={closeCard}
                      className="ml-2 px-2 text-[11px] text-gray-400 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      {authMode === "login" ? "Student Login" : "Student Registration"}
                    </p>
                    <h2 className="text-sm font-semibold text-gray-900 mt-1">
                      {authMode === "login"
                        ? "Sign in to your account"
                        : "Create a new account"}
                    </h2>
                  </div>

                  {msg && (
                    <div
                      className={`mb-3 text-[11px] rounded-md px-3 py-2 border ${
                        msg.toLowerCase().includes("success")
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-red-700 bg-red-50 border-red-200"
                      }`}
                    >
                      {msg}
                    </div>
                  )}

                  {authMode === "login" && (
                    <form onSubmit={submitLogin} className="space-y-3">
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, email: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="student@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, password: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 text-xs font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 ${
                          loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {loading ? (
                          <span>Logging in...</span>
                        ) : (
                          <>
                            <span>Login as Student</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {authMode === "register" && (
                    <form onSubmit={submitRegister} className="space-y-3">
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={regForm.name}
                            onChange={(e) =>
                              setRegForm({ ...regForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={regForm.email}
                            onChange={(e) =>
                              setRegForm({ ...regForm, email: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="student@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={regForm.password}
                            onChange={(e) =>
                              setRegForm({ ...regForm, password: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 text-xs font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 ${
                          loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {loading ? (
                          <span>Creating account...</span>
                        ) : (
                          <>
                            <span>Register & Proceed to Payment</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  <p className="text-[10px] text-gray-500 text-center mt-3">
                    {authMode === "login"
                      ? "New here? Switch to Register tab to create account."
                      : "Already registered? Switch to Login tab to sign in."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ===== BELOW THE FOLD: COMPACT STATS + FEATURES ===== */}
          <section className="pb-12">
            {/* Compact stats cards */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { number: "10K+", label: "Students", color: "from-[#FFCD2C] to-[#E0AC00]" },
                  { number: "99.8%", label: "Uptime", color: "from-green-500 to-green-600" },
                  { number: "500+", label: "Exams", color: "from-[#FFB200] to-[#FF8A00]" },
                  { number: "24/7", label: "Support", color: "from-orange-500 to-orange-600" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-[#FFEBD0] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact feature cards */}
            <div className="bg-transparent" id="why-choose">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Why Choose Our Platform
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] rounded-full mx-auto mt-3" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`relative bg-white/90 rounded-xl p-4 shadow-md border border-[#FFEBD0] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                        activeFeature === index ? "ring-2 ring-[#FFCD2C]" : ""
                      }`}
                      onMouseEnter={() => setActiveFeature(index)}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-xl transition-all duration-300 ${
                          activeFeature === index
                            ? "bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] scale-105"
                            : "bg-gradient-to-br from-gray-100 to-gray-200"
                        }`}
                      >
                        <span
                          className={
                            activeFeature === index ? "text-gray-900" : "text-gray-700"
                          }
                        >
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
        {/* Footer completely removed (alag file se banoge) */}
      </div>
    </div>
  );
}
