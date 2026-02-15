// src/Student-layout/StudentNavbar.jsx
import { useState, useEffect, useRef } from "react";
import { FaYoutube, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function StudentNavbar({ onToggleSidebar }) {
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-30 bg-[#FEECD5]/90 backdrop-blur-xl border-b border-[#FFE6A3] shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="sm:hidden mr-1 px-2 py-1 rounded-lg bg-white/80 border border-[#FFE6A3] text-xs text-gray-800"
            >
              Menu
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center text-xs font-bold text-gray-900 shadow">
              ST
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                Student Area
              </p>
              <p className="text-sm font-semibold text-gray-900">
                TTT Student Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-white/80 border border-[#FFE6A3] text-gray-700 shadow-sm">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 bg-white/80 border border-[#FFE6A3] rounded-full hover:bg-[#FFF3C4] transition"
              >
                <span className="w-7 h-7 rounded-full bg-[#FFCD2C] text-gray-900 flex items-center justify-center text-xs font-bold">
                  S
                </span>
                <span className="hidden sm:block text-[11px] text-gray-800">
                  Profile
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#FFE6A3] bg-white/95 shadow-xl backdrop-blur">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center text-sm font-bold text-gray-900 shadow">
                        ST
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          Riya Sharma
                        </div>
                        <div className="text-[11px] text-gray-600">
                          Class 8 | Roll No: STU-1023
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Student, The True Topper
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-[11px] text-gray-700">
                      Email: student@truetopper.com
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">
                        Social Media
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        <a
                          href="https://www.youtube.com/@TheTrueTopper"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-red-600"
                          aria-label="YouTube"
                        >
                          <FaYoutube className="text-sm" />
                        </a>
                        <a
                          href="https://www.instagram.com/thetruetopperpvtltd/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-pink-600"
                          aria-label="Instagram"
                        >
                          <FaInstagram className="text-sm" />
                        </a>
                        <a
                          href="https://www.linkedin.com/company/thetruetopper/posts/?feedView=all"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-sky-700"
                          aria-label="LinkedIn"
                        >
                          <FaLinkedinIn className="text-sm" />
                        </a>
                        <a
                          href="https://x.com/TheTrueTopper"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-gray-800"
                          aria-label="X"
                        >
                          <FaTwitter className="text-sm" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

