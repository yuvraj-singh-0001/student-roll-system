import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    { icon: "🔒", title: "Secure Testing", desc: "Advanced proctoring & anti-cheating" },
    { icon: "📊", title: "AI Analytics", desc: "Real-time performance insights" },
    { icon: "⚡", title: "Fast Results", desc: "Instant grading & reporting" },
    { icon: "📱", title: "Any Device", desc: "Fully responsive on all screens" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-blue-200 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="relative px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">TE</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                TestEdu
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"></div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="relative px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 group"
            >
              <span className="relative z-10">Sign In</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
            <button 
              onClick={() => navigate("/admin")}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Admin
            </button>
          </div>
        </header>

        {/* Main Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="text-center mb-16">
            {/* Animated Title */}
            <div className="mb-6 overflow-hidden">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                  Professional
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-900 to-black mt-2">
                  Exam Platform
                </span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in">
              Enterprise-grade examination system with AI-powered analytics, 
              real-time monitoring, and secure proctoring for educational institutions.
            </p>

            {/* Animated CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => navigate("/student")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-500"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <span className="text-lg">🎓</span>
                  Student Portal
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </button>

              <button
                onClick={() => navigate("/admin")}
                className="group relative px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <span className="text-lg">⚙️</span>
                  Admin Dashboard
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </button>
            </div>

            {/* Stats with Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { number: "10K+", label: "Students", color: "from-blue-500 to-blue-600" },
                { number: "99.8%", label: "Uptime", color: "from-green-500 to-green-600" },
                { number: "500+", label: "Exams", color: "from-purple-500 to-purple-600" },
                { number: "24/7", label: "Support", color: "from-orange-500 to-orange-600" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid with Animation */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer ${
                    activeFeature === index 
                      ? 'ring-2 ring-blue-500 shadow-xl' 
                      : 'hover:shadow-xl'
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center text-2xl transition-all duration-500 ${
                    activeFeature === index 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-110' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200'
                  }`}>
                    <span className={activeFeature === index ? 'text-white' : 'text-gray-700'}>
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                  
                  {/* Animated underline */}
                  <div className={`mt-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ${
                    activeFeature === index ? 'w-full' : ''
                  }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Cards with Hover Effects */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Student Login Card */}
            <div 
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-2xl border border-blue-100 hover:border-blue-300 transition-all duration-700 hover:shadow-3xl transform hover:-translate-y-2"
              onClick={() => navigate("/student")}
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tr from-indigo-200 to-transparent rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl text-white">🎓</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Portal</h2>
                    <p className="text-gray-600">Access exams & results</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {["Take scheduled exams", "View detailed results", "Track progress", "Get performance insights"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 group-hover:text-gray-800 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-blue-600 text-sm">✓</span>
                      </div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 group-hover:from-blue-700 group-hover:to-indigo-700 transform group-hover:-translate-y-1">
                  <span className="flex items-center justify-center gap-3">
                    Login as Student
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Admin Login Card */}
            <div 
              className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-2xl border border-gray-200 hover:border-gray-400 transition-all duration-700 hover:shadow-3xl transform hover:-translate-y-2"
              onClick={() => navigate("/admin")}
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-gray-200 to-transparent rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tr from-gray-300 to-transparent rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl text-white">👨‍💼</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                    <p className="text-gray-600">Manage exams & analytics</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {["Create & manage exams", "Monitor live sessions", "Analytics dashboard", "User management"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 group-hover:text-gray-800 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-gray-700 text-sm">⚙️</span>
                      </div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 group-hover:from-gray-900 group-hover:to-black transform group-hover:-translate-y-1">
                  <span className="flex items-center justify-center gap-3">
                    Admin Login
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">TE</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">TestEdu Platform</h3>
                  <p className="text-gray-600 text-sm">Professional Examination System</p>
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
                <p className="text-gray-500 text-xs mt-1">v2.1.0 • Enterprise Edition</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}