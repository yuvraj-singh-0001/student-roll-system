// src/hooks/useActivityTracker.js
import { useEffect } from 'react';
import { activityApi } from '../api';

// studentId should be passed from context or props
export default function useActivityTracker(studentId) {
  useEffect(() => {
    if (!studentId) return undefined;
    let start = Date.now();

    const logDuration = (duration) => {
      if (!studentId) return;
      if (!Number.isFinite(duration) || duration <= 0) return;
      activityApi
        .logWebsite(studentId, window.location.pathname, duration)
        .catch(() => {});
    };

    const handleVisibility = () => {
      if (document.hidden) {
        const duration = Date.now() - start;
        logDuration(duration);
        start = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      const duration = Date.now() - start;
      logDuration(duration);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [studentId]);
}
