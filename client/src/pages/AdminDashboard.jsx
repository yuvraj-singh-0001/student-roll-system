import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const links = [
    { path: "/admin/questions", label: "Add Questions", desc: "Add & manage exam questions", icon: "📋" },
    { path: "/admin/exam-dashboard", label: "Exam Dashboard", desc: "Analytics, scores, question stats", icon: "📊" },
    { path: "/admin/view-students", label: "View Students", desc: "All registered students", icon: "👥" },
    { path: "/admin/add-student", label: "Add Student", desc: "Register a new student", icon: "➕" },
    { path: "/admin/send-notification", label: "Send Notification", desc: "Notify students via email", icon: "📧" },
  ];

  return (
    <div className="min-h-screen admin-bg">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Back to Home"
            >
              ← Home
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-800">Admin Panel</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800">Admin actions</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage exam, questions, and students.</p>
        </div>

        <div className="space-y-3">
          {links.map((link, i) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 text-left group animate-fade-in-up`}
              style={{ animationDelay: `${0.05 * (i + 1)}s` }}
            >
              <div className="w-11 h-11 rounded-lg bg-slate-700 text-white flex items-center justify-center text-lg shadow group-hover:bg-slate-800 transition-colors">
                {link.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{link.label}</h3>
                <p className="text-sm text-slate-500">{link.desc}</p>
              </div>
              <span className="text-slate-400 font-medium group-hover:text-slate-600">→</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
