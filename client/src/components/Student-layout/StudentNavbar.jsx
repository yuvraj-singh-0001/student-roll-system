// src/Student-layout/StudentNavbar.jsx
import { useState, useEffect, useRef } from "react";
import {
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { studentApi } from "../../api";
import SocialMediaLinkModal from "../SocialMediaLinkModal";

const PROFILE_KEYS = {
  name: "studentProfileName",
  className: "studentProfileClass",
  username: "studentProfileUsername",
  email: "studentProfileEmail",
  loginTime: "studentProfileLoginTime",
  avatar: "studentProfileAvatar",
};

const readProfile = () => {
  if (typeof window === "undefined") {
    return {
      name: "Guest",
      className: "",
      username: "",
      email: "",
      loginTime: "",
      avatar: "",
    };
  }
  const stored = {
    name:
      localStorage.getItem(PROFILE_KEYS.name) ||
      localStorage.getItem("studentName") ||
      localStorage.getItem("formAName") ||
      "Guest",
    className:
      localStorage.getItem(PROFILE_KEYS.className) ||
      localStorage.getItem("studentClass") ||
      "",
    username: localStorage.getItem(PROFILE_KEYS.username) || "",
    email:
      localStorage.getItem(PROFILE_KEYS.email) ||
      localStorage.getItem("studentEmail") ||
      "",
    loginTime:
      localStorage.getItem(PROFILE_KEYS.loginTime) ||
      localStorage.getItem("loginTime") ||
      "",
    avatar: localStorage.getItem(PROFILE_KEYS.avatar) || "",
  };
  return stored;
};

const formatLoginTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const displayValue = (value) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

const getInitial = (name) => {
  const text = String(name || "").trim();
  return text ? text.charAt(0).toUpperCase() : "S";
};

const getNameWithoutInitial = (name) => {
  const text = String(name || "").trim();
  if (!text) return "-";
  const rest = text.slice(1);
  return rest || "-";
};

export default function StudentNavbar({ onToggleSidebar }) {
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => readProfile());
  const [photoError, setPhotoError] = useState("");
  const profileRef = useRef(null);
  const photoInputRef = useRef(null);

  // Social Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  // Use either stored examStudentId or profile rollNumber/studentId
  const studentId =
    localStorage.getItem("examStudentId") ||
    localStorage.getItem("studentId") ||
    "";

  const openSocialModal = (platform) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
    setProfileOpen(false); // Close profile dropdown when modal opens
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    setProfile(readProfile());
    let cancelled = false;
    (async () => {
      try {
        const { data } = await studentApi.profile();
        if (cancelled) return;
        if (data?.success && data?.data) {
          const incoming = data.data || {};
          const updates = {};
          if (incoming.name) updates[PROFILE_KEYS.name] = incoming.name;
          if (incoming.className)
            updates[PROFILE_KEYS.className] = incoming.className;
          if (incoming.username)
            updates[PROFILE_KEYS.username] = incoming.username;
          if (incoming.email) updates[PROFILE_KEYS.email] = incoming.email;
          const examId = String(
            incoming.rollNumber || incoming.studentId || "",
          ).trim();
          if (examId) updates.examStudentId = examId;
          if (!localStorage.getItem(PROFILE_KEYS.loginTime)) {
            updates[PROFILE_KEYS.loginTime] = new Date().toISOString();
          }
          if (Object.keys(updates).length > 0) {
            updateLocalProfile(updates);
          }
        }
      } catch {
        // ignore profile fetch errors
      }
    })();
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      cancelled = true;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  useEffect(() => {
    const handleStorage = () => setProfile(readProfile());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateLocalProfile = (updates) => {
    if (typeof window === "undefined") return;
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    });
    setProfile(readProfile());
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload a valid image file.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setPhotoError("Image size should be under 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      updateLocalProfile({ [PROFILE_KEYS.avatar]: result });
      setPhotoError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateLocalProfile({ [PROFILE_KEYS.avatar]: "" });
  };

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
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
              </p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <span>Welcome,</span>
                <span>{displayValue(profile.name)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-white/80 border border-[#FFE6A3] text-gray-700 shadow-sm">
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 bg-white/80 border border-[#FFE6A3] rounded-full hover:bg-[#FFF3C4] transition"
              >
                <span className="w-7 h-7 rounded-full bg-[#FFCD2C] text-gray-900 flex items-center justify-center text-xs font-bold overflow-hidden">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitial(profile.name)}</span>
                  )}
                </span>
                <span className="hidden sm:block text-[11px] text-gray-800">
                  Profile
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#FFE6A3] bg-white/95 shadow-xl backdrop-blur">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFCD2C] to-[#E0AC00] flex items-center justify-center text-sm font-bold text-gray-900 shadow overflow-hidden">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{getInitial(profile.name)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {displayValue(profile.name)}
                        </div>
                        <div className="text-[11px] text-gray-600">
                          Class: {displayValue(profile.className)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Username: {displayValue(profile.username)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-[11px] text-gray-700">
                      <div className="rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2">
                        Gmail: {displayValue(profile.email)}
                      </div>
                      <div className="rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2">
                        Login time: {formatLoginTime(profile.loginTime)}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-[#FFE6A3] bg-white/80 text-gray-700 hover:bg-white transition"
                        >
                          {profile.avatar ? "Update Photo" : "Upload Photo"}
                        </button>
                        {profile.avatar && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-[#FFE6A3] bg-white/80 text-gray-500 hover:text-gray-700 hover:bg-white transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {photoError && (
                        <div className="mt-2 text-[10px] text-rose-600">
                          {photoError}
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">
                        Social Media
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        <button
                          onClick={() => openSocialModal("youtube")}
                          className="flex h-10 items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-red-600"
                          aria-label="YouTube"
                        >
                          <FaYoutube className="text-lg" />
                        </button>
                        <button
                          onClick={() => openSocialModal("instagram")}
                          className="flex h-10 items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-pink-600"
                          aria-label="Instagram"
                        >
                          <FaInstagram className="text-lg" />
                        </button>
                        <button
                          onClick={() => openSocialModal("linkedin")}
                          className="flex h-10 items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-sky-700"
                          aria-label="LinkedIn"
                        >
                          <FaLinkedinIn className="text-lg" />
                        </button>
                        <button
                          onClick={() => openSocialModal("x")}
                          className="flex h-10 items-center justify-center rounded-lg border border-[#FFE6A3] bg-white hover:bg-[#FFF3C4] transition text-gray-800"
                          aria-label="X"
                        >
                          <FaTwitter className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SocialMediaLinkModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={selectedPlatform}
        studentId={studentId}
      />
    </header>
  );
}
