import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SendNotification() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSend = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/notification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("✅ " + data.message);
        setTimeout(() => navigate("/admin"), 2000);
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen admin-bg">
      

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-in">
          <div className="h-1 bg-slate-700" />
          <div className="p-6 sm:p-8">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
              <p className="text-slate-700 text-sm">
                <strong className="text-slate-800">Note:</strong> Send personalized notifications (roll numbers, course, instructions) to all students via email.
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-semibold text-center ${
                  message.startsWith("✅")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Sending…
                </span>
              ) : (
                "Send now"
              )}
            </button>

            <button
              onClick={() => navigate("/admin")}
              disabled={loading}
              className="mt-3 w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition disabled:opacity-60"
            >
              ← Admin Panel
            </button>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <h3 className="font-semibold text-slate-800 text-sm mb-2">What will be sent</h3>
              <ul className="text-slate-600 text-sm space-y-1.5">
                <li>✓ Roll number</li>
                <li>✓ Course info</li>
                <li>✓ Instructions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
