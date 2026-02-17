import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { analysisApi } from "../../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const ACTIVITY_PAGE_SIZE = 5;

  const fetchOverview = async (options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      const { data: res } = await analysisApi.adminOverview();
      if (res.success) {
        setOverview(res.data);
        setRecentActivities(res.data.recentActivities || []);
      }
    } catch (e) {
      if (!silent) {
        setError(e.response?.data?.message || "Failed to load dashboard");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    fetchOverview();
    const intervalId = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetchOverview({ silent: true });
    }, 15000);
    const handleFocus = () => fetchOverview({ silent: true });
    window.addEventListener("focus", handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOverview({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    setActivitiesPage(1);
  }, [recentActivities.length]);

  const totals = overview?.totals || {};
  const today = overview?.today || {};

  const stats = [
    {
      label: "Total Students",
      value: totals.totalStudents ?? 0,
      change: `+${today.students ?? 0} today`,
      icon: "👥",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Total Questions",
      value: totals.totalQuestions ?? 0,
      change: `+${today.questions ?? 0} today`,
      icon: "📋",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Total Olympiad Exams",
      value: totals.totalExams ?? 0,
      change: `+${today.exams ?? 0} today`,
      icon: "🏆",
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Total Attempts (Students)",
      value: totals.totalAttempts ?? 0,
      change: `+${today.attempts ?? 0} today`,
      icon: "⚡",
      color: "from-orange-500 to-red-500",
    },
  ];

  const activitiesTotal = recentActivities.length;
  const activitiesTotalPages = Math.max(
    1,
    Math.ceil(activitiesTotal / ACTIVITY_PAGE_SIZE)
  );
  const activitiesPageSafe = Math.min(activitiesPage, activitiesTotalPages);
  const activitiesStart =
    activitiesTotal === 0
      ? 0
      : (activitiesPageSafe - 1) * ACTIVITY_PAGE_SIZE + 1;
  const activitiesEnd = Math.min(
    activitiesPageSafe * ACTIVITY_PAGE_SIZE,
    activitiesTotal
  );
  const pagedActivities = useMemo(() => {
    const start = (activitiesPageSafe - 1) * ACTIVITY_PAGE_SIZE;
    return recentActivities.slice(start, start + ACTIVITY_PAGE_SIZE);
  }, [recentActivities, activitiesPageSafe]);
  const activityPages = useMemo(
    () => Array.from({ length: activitiesTotalPages }, (_, i) => i + 1),
    [activitiesTotalPages]
  );

  const quickLinks = [
    {
      path: "/admin/questions",
      label: "Manage Questions",
      desc: "Create, edit & organize questions",
      icon: "📝",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      path: "/admin/exam-dashboard",
      label: "Exam Analytics",
      desc: "Detailed reports & insights",
      icon: "📈",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      path: "/admin/view-students",
      label: "Student Management",
      desc: "View & manage all students",
      icon: "👨‍🎓",
      color: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      path: "/admin/add-student",
      label: "Add Student",
      desc: "Register new student account",
      icon: "➕",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      path: "/admin/send-notification",
      label: "Send Notification",
      desc: "Email & push notifications",
      icon: "📨",
      color: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
      path: "/admin/settings",
      label: "System Settings",
      desc: "Platform configuration",
      icon: "⚙️",
      color: "bg-gradient-to-br from-gray-600 to-gray-800",
    },
  ];

  const formatScore = (value) => {
    if (value === null || value === undefined || value === "-" || value === "") {
      return "-";
    }
    const num = Number(value);
    if (!Number.isFinite(num)) return "-";
    return num.toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "scored":
        return "bg-emerald-100 text-emerald-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700 animate-pulse";
      case "failed":
        return "bg-red-100 text-red-700";
      case "registered":
        return "bg-purple-100 text-purple-700";
      case "updated":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "scored":
        return "🎯";
      case "in-progress":
        return "⏳";
      case "failed":
        return "❌";
      case "registered":
        return "👤";
      case "updated":
        return "✏️";
      default:
        return "📝";
    }
  };
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Live totals and recent activity (auto-updates).
          </p>
        </div>
        <button
          onClick={() => fetchOverview()}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#FFE6A3] bg-white/80 text-gray-700 hover:bg-white transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative flex items-center justify-between rounded-xl border border-[#FFE6A3] bg-white/90 px-3 py-2 shadow-md transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
          >
            <div>
              <div className="text-[11px] text-gray-500">{stat.label}</div>
              <div className="text-lg font-semibold text-gray-900">
                {stat.value}
              </div>
              <div className="text-[11px] text-emerald-700">
                {stat.change}
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-md bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <span className="text-sm text-white">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          <span className="text-xs text-gray-500">
            {quickLinks.length} actions
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="group flex items-center gap-2 rounded-xl border border-[#FFE6A3] bg-white/90 px-3 py-2 text-left shadow-md transition-all duration-500 hover:bg-white hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className={`w-7 h-7 rounded-md ${link.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-xs text-white">{link.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {link.label}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {link.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-2xl border border-[#FFE6A3] bg-white/90 overflow-hidden shadow-md transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5">
        <div className="px-3 py-2 border-b border-[#FFE6A3] bg-[#FFF9E6]/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Activities
            </h2>
            <p className="text-[11px] text-gray-500">
              Real-time student activity (latest first)
            </p>
          </div>
          <button className="text-xs font-medium text-gray-800 px-2 py-1 rounded-md border border-[#FFE6A3] bg-white/80 hover:bg-white transition">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#FFF9E6]/50">
              <tr className="border-b border-[#FFE6A3] text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Activity</th>
                <th className="py-2 px-3">Exam/Details</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Score</th>
                <th className="py-2 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF1CC]">
              {pagedActivities.map((activity, index) => {
                const rawScore = activity.score;
                const scoreNum =
                  typeof rawScore === "number" ? rawScore : Number(rawScore);
                const hasScore =
                  rawScore !== null &&
                  rawScore !== undefined &&
                  rawScore !== "-" &&
                  rawScore !== "" &&
                  Number.isFinite(scoreNum);
                const scoreClass = !hasScore
                  ? "text-gray-400"
                  : scoreNum >= 80
                  ? "text-emerald-600"
                  : scoreNum >= 60
                  ? "text-green-600"
                  : scoreNum >= 40
                  ? "text-yellow-600"
                  : "text-red-600";
                const rowId =
                  activity.id ||
                  activity.createdAt ||
                  `${activity.type || "activity"}-${index}`;
                const statusText = activity.status
                  ? activity.status.charAt(0).toUpperCase() +
                    activity.status.slice(1)
                  : "Update";
                return (
                  <tr
                    key={rowId}
                    onMouseEnter={() => setHoveredRow(rowId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`transition-colors ${
                      hoveredRow === rowId ? "bg-[#FFF9E6]/40" : "hover:bg-[#FFFDF2]"
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${
                            hoveredRow === rowId ? "scale-105" : ""
                          } transition-transform`}
                        >
                          <span className="text-[10px]">👤</span>
                        </div>
                        <span className="text-xs font-medium text-gray-900">
                          {activity.user}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {getStatusIcon(activity.status)}
                        </span>
                        <span className="text-xs text-gray-700">
                          {activity.action}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-xs font-medium text-gray-900">
                        {activity.exam}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(
                          activity.status
                        )}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className={`text-xs font-medium ${scoreClass}`}>
                        {hasScore ? formatScore(scoreNum) : "-"}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[11px] text-gray-500">
                        {activity.time}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#FFE6A3] px-3 py-2 bg-[#FFF9E6]/40">
          <div className="flex items-center justify-between text-[11px] text-gray-600">
            <span>
              Showing {activitiesStart}-{activitiesEnd} of {activitiesTotal} activities
            </span>
            {activitiesTotalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setActivitiesPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={activitiesPageSafe === 1}
                  className={`px-2 py-0.5 rounded border ${
                    activitiesPageSafe === 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-white"
                  }`}
                >
                  Prev
                </button>
                {activityPages.map((page) => (
                  <button
                    key={page}
                    onClick={() => setActivitiesPage(page)}
                    className={`px-2 py-0.5 rounded border ${
                      page === activitiesPageSafe
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setActivitiesPage((prev) =>
                      Math.min(activitiesTotalPages, prev + 1)
                    )
                  }
                  disabled={activitiesPageSafe === activitiesTotalPages}
                  className={`px-2 py-0.5 rounded border ${
                    activitiesPageSafe === activitiesTotalPages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-white"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}










