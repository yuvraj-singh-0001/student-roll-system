// src/components/SocialMediaLinkModal.jsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { activityApi } from "../api";

const PERSONAL_PLATFORM_URLS = {
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
  facebook: "https://www.facebook.com/",
  x: "https://x.com/",
  snapchat: "https://www.snapchat.com/",
  linkedin: "https://www.linkedin.com/",
};

const OFFICIAL_PLATFORM_URLS = {
  instagram: "https://www.instagram.com/thetruetopperpvtltd/",
  youtube: "https://www.youtube.com/@TheTrueTopper",
  linkedin: "https://www.linkedin.com/company/thetruetopper/posts/?feedView=all",
  x: "https://x.com/",
  facebook: "https://www.facebook.com/",
  snapchat: "https://www.snapchat.com/",
};

const PLATFORM_LABELS = {
  youtube: "YouTube",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  facebook: "Facebook",
  snapchat: "Snapchat",
};

export default function SocialMediaLinkModal({
  open,
  onClose,
  platform,
  studentId,
  linkSource = "personal",
  customUrls,
}) {
  const [startTime, setStartTime] = useState(null);
  const [hasOpened, setHasOpened] = useState(false);

  const normalizedSource = String(linkSource || "personal").toLowerCase();
  const normalizedPlatform = String(platform || "").toLowerCase();
  const activePlatformUrls =
    customUrls && typeof customUrls === "object"
      ? customUrls
      : normalizedSource === "official"
        ? OFFICIAL_PLATFORM_URLS
        : PERSONAL_PLATFORM_URLS;
  const platformLabel = PLATFORM_LABELS[normalizedPlatform] || "Social Media";

  useEffect(() => {
    if (open) {
      setStartTime(Date.now());
      setHasOpened(false);
    }
  }, [open]);

  const handleOpenLink = () => {
    setHasOpened(true);
    const src = activePlatformUrls[normalizedPlatform] || "https://www.example.com";
    window.open(src, "_blank", "noopener,noreferrer");
  };

  const handleClose = async () => {
    // Only log time if they actually opened the link
    if (hasOpened && studentId && normalizedPlatform) {
      const durationMs = Date.now() - (startTime || Date.now());
      try {
        await activityApi.logSocial(studentId, normalizedPlatform, durationMs);
      } catch (err) {
        console.error("Failed to log social activity:", err);
      }
    }
    onClose();
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-11/12 max-w-md p-6 shadow-2xl border border-[#FFE6A3]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold capitalize text-gray-900">Social Media</h3>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            For security reasons, social media cannot be loaded inside the app.
          </p>
          <p className="text-sm text-gray-800 font-medium pb-2">
            Click below to open {platformLabel} in a new tab.
            Your time will be tracked until you close this window.
          </p>

          <button
            type="button"
            onClick={handleOpenLink}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-bold hover:shadow-lg transition"
          >
            Open {platformLabel}
          </button>

          {hasOpened && (
            <p className="text-xs text-green-600 mt-4 animate-pulse">
              Tracking time... Click the X button when you are done.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined" || !document.body) {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}
