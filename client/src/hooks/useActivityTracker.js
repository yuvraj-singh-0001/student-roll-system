// src/hooks/useActivityTracker.js
import { useEffect } from 'react';
import { activityApi } from '../api';

// studentId should be passed from context or props
export default function useActivityTracker(studentId) {
  useEffect(() => {
    let start = Date.now();
    const handleVisibility = () => {
      if (document.hidden) {
        const duration = Date.now() - start;
        activityApi.logWebsite(studentId, window.location.pathname, duration);
        start = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      const duration = Date.now() - start;
      activityApi.logWebsite(studentId, window.location.pathname, duration);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [studentId]);
}
