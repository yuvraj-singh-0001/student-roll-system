import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
// Maine admin Dashboard  banata haui ek screen par more actions button ho sake ...
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-t-2xl p-4 sm:p-6 text-center text-white shadow-lg">
          <div className="text-4xl sm:text-5xl mb-2 animate-bounce">🎓</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">Admin Panel</h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">Student Management System</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-5 sm:p-6 border-t-4 border-purple-500 overflow-hidden">
          <p className="text-gray-600 text-xs sm:text-sm text-center mb-5 leading-relaxed">
            Send official notifications to all registered students.
          </p>

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => navigate("/send-notification")}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 active:scale-95"
            >
               Send Notification
            </button>

            <button
              onClick={() => navigate("/view-students")}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105 hover:from-teal-600 hover:to-cyan-600 active:scale-95"
            >
               View Students
            </button>

            <button
              onClick={() => navigate("/add-student")}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105 hover:from-green-600 hover:to-emerald-600 active:scale-95"
            >
               Add New Student
            </button>

            <button
              onClick={() => navigate("/exam/register")}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105 active:scale-95"
            >
               Exam Register
            </button>

            <button
              onClick={() => navigate("/exam")}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105 active:scale-95"
            >
               Give Exam
            </button>

            <button
              onClick={() => navigate("/admin/questions")}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105 active:scale-95"
            >
               Add Questions (Exam)
            </button>

            <button
              onClick={() => navigate("/admin/exam-dashboard")}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105 active:scale-95"
            >
               Exam Dashboard
            </button>
          </div>

          {/* Status Badges */}
          <div className="mt-5 flex justify-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-green-100 to-teal-100 text-green-700 font-semibold text-xs border border-green-200">
              ✓ Active
            </span>
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-xs border border-blue-200">
              👤 Admin
            </span>
            
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-4 px-2">
          <p className="font-semibold">The True topper © 2026</p>
          <p className="text-gray-400">Roll System v1.0</p>
        </div>
      </div>
    </div>
  );
}
