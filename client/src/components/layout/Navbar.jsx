import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/TTT-logo.png";

export default function Navbar({ onStudentLoginClick }) {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#FEECD5]/90 backdrop-blur-sm border-b border-[#f6d2a8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        {/* ===== LOGO SECTION ===== */}
        <div className="flex items-center">
          <div className="h-10 sm:h-11 md:h-12 w-32 sm:w-40 md:w-44 flex items-center">
            <img
              src={logo}
              alt="The True Topper Logo"
              className="h-full w-full object-contain select-none pointer-events-none"
            />
          </div>
        </div>

        {/* ===== BUTTONS ===== */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onStudentLoginClick}
            className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-900 transition"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition"
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}
