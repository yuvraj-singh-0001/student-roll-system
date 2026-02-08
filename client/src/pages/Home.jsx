import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";

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

  // LOGIN
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

      if (user.isPaid) {
        navigate("/student");
      } else {
        navigate("/payment");
      }
    } catch {
      setMsg("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const submitRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await registerUser(regForm);

      setMsg(res.message || "");

      if (res.success) {
        const { data } = res; // { id, name, email }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFF3C4] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-[#FFE6A3] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-[#FFEBD0] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Floating Particles */}
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

      <div className="relative z-10">
        {/* Header */}
        <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-gray-900 font-bold text-lg">TE</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                TestEdu
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] rounded-full mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => openCard("login")}
              className="relative px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 group"
            >
              <span className="relative z-10">Sign In</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#FFF3C4] to-[#FFE6A3] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-black hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Admin
            </button>
          </div>
        </header>

        {/* HERO + CARD */}
        <main className="pt-8 pb-20">
          <div
            className={`
              max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
              grid gap-10 items-center mb-16
              transition-all duration-500
              ${
                loginOpen
                  ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
                  : "lg:grid-cols-1 place-items-center"
              }
            `}
          >
            {/* LEFT text */}
            <div
              className={`
                transition-all duration-500 w-full
                ${
                  loginOpen
                    ? "lg:justify-self-start text-left lg:text-left"
                    : "justify-self-center text-center lg:text-center"
                }
              `}
            >
              <div className="mb-6 overflow-hidden">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFCD2C] via-[#E0AC00] to-[#FFB200] animate-gradient">
                    Professional
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-900 to-black mt-2">
                    Exam Platform
                  </span>
                </h1>
              </div>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in">
                Enterprise-grade examination system with AI-powered analytics,
                real-time monitoring, and secure proctoring for educational institutions.
              </p>

              <div
                className={`
                  flex flex-wrap gap-4 transition-all duration-500
                  ${loginOpen ? "justify-start" : "justify-center"}
                `}
              >
                <button
                  onClick={() => openCard("login")}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-3">
                    <span className="text-lg">🎓</span>
                    Student Portal
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => navigate("/admin")}
                  className="group relative px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-[#FFCD2C]/70 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:bg-[#FFF3C4]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF2] to-[#FFF3C4] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-3">
                    <span className="text-lg">⚙️</span>
                    Admin Dashboard
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT: Login/Register card */}
            <div
              className={`
                w-full lg:w-[380px]
                transition-all duration-500
                ${
                  loginOpen
                    ? "opacity-100 translate-y-0 max-h-[580px]"
                    : "opacity-0 -translate-y-4 max-h-0 overflow-hidden pointer-events-none"
                }
              `}
            >
              {loginOpen && (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-[#FFE6A3] p-6 sm:p-8 animate-fade-in-up">
                  {/* Tabs + close */}
                  <div className="flex items-center mb-4">
                    <div className="flex flex-1 bg-[#FFF7DA] rounded-full p-1 text-xs font-medium">
                      <button
                        onClick={() => {
                          setAuthMode("login");
                          setMsg("");
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-full transition-all ${
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
                        className={`flex-1 px-3 py-1.5 rounded-full transition-all ${
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

                  <div className="mb-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      {authMode === "login" ? "Student Login" : "Student Registration"}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900 mt-1">
                      {authMode === "login"
                        ? "Sign in to your account"
                        : "Create a new account"}
                    </h2>
                  </div>

                  {msg && (
                    <div
                      className={`mb-3 text-xs rounded-md px-3 py-2 border ${
                        msg.toLowerCase().includes("success")
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-red-700 bg-red-50 border-red-200"
                      }`}
                    >
                      {msg}
                    </div>
                  )}

                  {/* LOGIN FORM */}
                  {authMode === "login" && (
                    <form onSubmit={submitLogin} className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, email: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="student@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, password: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 ${
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

                  {/* REGISTER FORM */}
                  {authMode === "register" && (
                    <form onSubmit={submitRegister} className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={regForm.name}
                            onChange={(e) =>
                              setRegForm({ ...regForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={regForm.email}
                            onChange={(e) =>
                              setRegForm({ ...regForm, email: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="student@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={regForm.password}
                            onChange={(e) =>
                              setRegForm({ ...regForm, password: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCD2C] focus:border-[#FFCD2C]"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 ${
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

                  <p className="text-[11px] text-gray-500 text-center mt-4">
                    {authMode === "login"
                      ? "New here? Switch to Register tab to create account."
                      : "Already registered? Switch to Login tab to sign in."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: "10K+", label: "Students", color: "from-[#FFCD2C] to-[#E0AC00]" },
                { number: "99.8%", label: "Uptime", color: "from-green-500 to-green-600" },
                { number: "500+", label: "Exams", color: "from-[#FFB200] to-[#FF8A00]" },
                { number: "24/7", label: "Support", color: "from-orange-500 to-orange-600" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#FFEBD0] hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                  >
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why choose */}
          <div className="mb-20 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Our Platform
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] rounded-full mx-auto" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`relative bg-white rounded-2xl p-6 shadow-lg border border-[#FFEBD0] transition-all duration-500 transform hover:-translate-y-2 cursor-pointer ${
                      activeFeature === index
                        ? "ring-2 ring-[#FFCD2C] shadow-xl"
                        : "hover:shadow-xl"
                    }`}
                    onMouseEnter={() => setActiveFeature(index)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center text-2xl transition-all duration-500 ${
                        activeFeature === index
                          ? "bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] scale-110"
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.desc}
                    </p>

                    <div
                      className={`mt-4 h-0.5 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] rounded-full transition-all duration-500 ${
                        activeFeature === index ? "w-full" : "w-8"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-[#FFE6A3] bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-gray-900 font-bold">TE</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">TestEdu Platform</h3>
                  <p className="text-gray-600 text-sm">
                    Professional Examination System
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300">
                  Privacy Policy
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300">
                  Terms of Service
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300">
                  Contact Support
                </button>
              </div>

              <div className="text-center md:text-right">
                <p className="text-gray-600 text-sm">
                  © 2024 TestEdu. All rights reserved.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  v2.1.0 • Enterprise Edition
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
