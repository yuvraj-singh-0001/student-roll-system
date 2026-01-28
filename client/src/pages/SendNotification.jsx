import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SendNotification() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
// Ye screen notification bhejne ke liye hai jisme ek button hoga jo API call karega ...
  const handleSend = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const response = await fetch("http://localhost:5000/api/notification/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ " + data.message);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };
// Ye screen notification bhejne ke liye hai jisme ek button hoga jo API call karega ...  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-t-2xl p-4 sm:p-6 text-center text-white shadow-lg">
          <div className="text-4xl sm:text-5xl mb-2 animate-pulse">📧</div>
          <h1 className="text-2xl sm:text-3xl font-bold">Send Notifications</h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">Roll Numbers to All Students</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-5 sm:p-6 border-t-4 border-purple-500 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-2.5 sm:p-3 rounded-lg mb-4">
            <p className="text-gray-700 text-xs leading-relaxed">
              <strong className="text-blue-600">📌 Note:</strong> Send personalized notifications to all students via email.
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-2.5 rounded-lg font-semibold text-center text-xs border-l-4 ${
              message.startsWith("✅") 
                ? "bg-gradient-to-r from-green-50 to-teal-50 text-green-800 border-green-500" 
                : "bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-500"
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={loading}
            className={`w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold rounded-lg text-white transition duration-300 shadow-md hover:shadow-lg transform active:scale-95 overflow-hidden ${
              loading 
                ? "bg-gray-400 cursor-not-allowed opacity-60" 
                : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:scale-105"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block">⏳</span>
                <span>Sending...</span>
              </span>
            ) : (
              <span> Send Now</span>
            )}
          </button>

          <button
            onClick={() => navigate("/")}
            disabled={loading}
            className="mt-2 w-full py-2 sm:py-2.5 px-4 border-2 border-purple-500 text-purple-600 font-semibold text-xs sm:text-sm rounded-lg hover:bg-purple-50 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-600 active:scale-95"
          >
            ← Back
          </button>

          {/* Info Section */}
          <div className="mt-4 pt-3 border-t-2 border-gray-200">
            <h3 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1">
              <span>📋</span>
              <span>What will be sent:</span>
            </h3>
            <ul className="text-gray-600 text-xs space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                <span>Roll Number</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500 font-bold flex-shrink-0">✓</span> 
                <span>Course Info</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-500 font-bold flex-shrink-0">✓</span>
                <span>Instructions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500 font-bold flex-shrink-0">✓</span>
                <span>Professional Format</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-4 px-2">
          <p className="font-semibold">The true topper</p>
          <p className="text-gray-400">Roll System v1.0</p>
        </div>
      </div>
    </div>
  );
}
