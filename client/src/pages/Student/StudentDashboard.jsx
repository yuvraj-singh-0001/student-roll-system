import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const actions = [
    { 
      path: "/student/register", 
      label: "Exam Registration", 
      desc: "Register with name & email, get your Student ID",
      icon: "📝",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      path: "/student/exam", 
      label: "Give Exam", 
      desc: "Take the online test with confidence levels",
      icon: "✏️",
      color: "from-purple-500 to-pink-500"
    },
    { 
      path: "/student/result", 
      label: "View Results", 
      desc: "Check your exam scores and performance",
      icon: "📊",
      color: "from-green-500 to-emerald-500"
    },
    { 
      path: "/", 
      label: "Back to Home", 
      desc: "Return to main website homepage",
      icon: "🏠",
      color: "from-gray-600 to-gray-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="group flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  aria-label="Back to Home"
                >
                  <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span>Home</span>
                </button>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">Student Portal</h1>
                    <p className="text-xs text-gray-500">Access exams and results</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">Portal Active</span>
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg shadow-sm">
                  <div className="text-xs font-medium">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl text-white">🎓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Welcome to Student Portal</h2>
            <p className="text-sm text-gray-500 mt-2">Choose an action to continue</p>
          </div>

          {/* Actions Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {actions.map((action, index) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-xl text-white">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-700 transform group-hover:translate-x-1 transition-all duration-300">
                    →
                  </span>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              Quick Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-xs text-gray-600 mb-1">Step 1</div>
                <div className="text-sm font-medium text-blue-600">Register</div>
                <div className="text-xs text-gray-500">Get Student ID</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-xs text-gray-600 mb-1">Step 2</div>
                <div className="text-sm font-medium text-purple-600">Take Exam</div>
                <div className="text-xs text-gray-500">Answer questions</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-xs text-gray-600 mb-1">Step 3</div>
                <div className="text-sm font-medium text-green-600">View Results</div>
                <div className="text-xs text-gray-500">Check scores</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
              <div className="text-lg font-bold text-gray-900">100+</div>
              <div className="text-xs text-gray-500">Students</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
              <div className="text-lg font-bold text-gray-900">85%</div>
              <div className="text-xs text-gray-500">Avg Score</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
              <div className="text-lg font-bold text-gray-900">24/7</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/90 py-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Student Portal</span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                  <span>Time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Help
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  FAQ
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}