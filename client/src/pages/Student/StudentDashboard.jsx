import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  olympiadExamApi,
  examApi,
  studentApi,
  activityApi,
  questionApi,
} from "../../api";
import {
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import useActivityTracker from "../../hooks/useActivityTracker";
import SocialMediaLinkModal from "../../components/SocialMediaLinkModal";

const EXAM_CACHE_KEY = "examListCacheV1";
const EXAM_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const readExamListCache = (options = {}) => {
  if (typeof window === "undefined") return null;
  const allowStale = options.allowStale === true;
  try {
    const raw = localStorage.getItem(EXAM_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || !parsed.ts) return null;
    const ageMs = Date.now() - parsed.ts;
    if (!allowStale && ageMs > EXAM_CACHE_TTL_MS) return null;
    return { data: parsed.data, isStale: ageMs > EXAM_CACHE_TTL_MS };
  } catch {
    return null;
  }
};

const writeExamListCache = (list) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      EXAM_CACHE_KEY,
      JSON.stringify({ data: Array.isArray(list) ? list : [], ts: Date.now() })
    );
  } catch {}
};

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="2,4 6,8 10,4" />
  </svg>
);

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [recentResults, setRecentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  const [examList, setExamList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");
  const [examRefreshing, setExamRefreshing] = useState(false);
  const fetchingRef = useRef(false);
  const cancelledRef = useRef(false);

  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [mockError, setMockError] = useState("");
  const [selectedExamForMocks, setSelectedExamForMocks] = useState(null);
  const [mockTests, setMockTests] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

  const studentId =
    localStorage.getItem("studentId") || localStorage.getItem("examStudentId");
  useActivityTracker(studentId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [activityStats, setActivityStats] = useState({
    socialTotalMs: 0,
    websiteTotalMs: 0,
    combinedTotalMs: 0,
  });

  const fetchActivityStats = useCallback(() => {
    if (studentId) {
      activityApi
        .summary(studentId)
        .then((res) => {
          if (res?.data?.success) {
            setActivityStats(
              res.data.data || {
                socialTotalMs: 0,
                websiteTotalMs: 0,
                combinedTotalMs: 0,
              }
            );
          }
        })
        .catch((err) => console.error(err));
    }
  }, [studentId]);

  useEffect(() => {
    fetchActivityStats();
  }, [fetchActivityStats]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlatform("");
    fetchActivityStats();
  };

  const openSocialModal = (platform) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const formatMs = (ms) => {
    if (!ms) return "0 min";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min === 0) return `${sec}s`;
    return `${min}m ${sec}s`;
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString();
  };

  const formatDateOnly = (value) => {
    if (!value) return "—";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString();
  };

  const fetchExamList = useCallback(async (options = {}) => {
    const silent = options.silent === true;
    const forceRefresh = options.forceRefresh === true;
    if (fetchingRef.current || cancelledRef.current) return;
    fetchingRef.current = true;
    const cachedNow = readExamListCache({ allowStale: true });
    const hasCacheNow = Array.isArray(cachedNow?.data) && cachedNow.data.length > 0;
    if (forceRefresh) setExamRefreshing(true);
    if (!silent && !hasCacheNow) setExamLoading(true);
    if (!silent && !forceRefresh) setExamError("");
    try {
      const { data } = await examApi.list({
        retries: 2,
        retryDelayMs: 1500,
        params: forceRefresh ? { refresh: 1 } : undefined,
      });
      if (cancelledRef.current) return;
      if (data.success) {
        const list = data.data || [];
        setExamList(list);
        writeExamListCache(list);
      } else if (!silent && !hasCacheNow) {
        setExamError(data.message || "Failed to load exams");
      }
    } catch (e) {
      if (!cancelledRef.current && !silent && !hasCacheNow)
        setExamError(e.response?.data?.message || "Failed to load exams");
    } finally {
      if (!cancelledRef.current) {
        if (!silent && !hasCacheNow) setExamLoading(false);
        if (forceRefresh) setExamRefreshing(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  const openMocksForExam = async (exam) => {
    if (!exam?.examCode) return;
    setSelectedExamForMocks(exam);
    setMockModalOpen(true);
    setMockError("");
    setMockTests([]);
    try {
      setMockLoading(true);
      const { data } = await questionApi.mocks({ examCode: exam.examCode });
      if (data?.success) setMockTests(data.data || []);
      else setMockError(data?.message || "Failed to load mock tests");
    } catch (e) {
      setMockError(e.response?.data?.message || "Failed to load mock tests");
    } finally {
      setMockLoading(false);
    }
  };

  const closeMockModal = () => {
    setMockModalOpen(false);
    setSelectedExamForMocks(null);
    setMockTests([]);
    setMockError("");
  };

  const toggleExamSection = (examCode, section) => {
    const key = `${String(examCode || "").trim()}::${section}`;
    if (!key) return;
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    cancelledRef.current = false;
    const cachedFresh = readExamListCache();
    const cachedStale = cachedFresh ? null : readExamListCache({ allowStale: true });
    const activeCache = cachedFresh || cachedStale;
    const hasCache = Array.isArray(activeCache?.data) && activeCache.data.length > 0;
    if (hasCache) setExamList(activeCache.data);
    setExamLoading(!hasCache);
    setExamError("");
    if (!hasCache) fetchExamList({ silent: false });
    else if (activeCache?.isStale) fetchExamList({ silent: true });
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchExamList]);

  const handleManualRefresh = () => {
    setExamError("");
    fetchExamList({ silent: true, forceRefresh: true });
  };

  useEffect(() => {
    let cancelled = false;
    setResultsLoading(true);
    setResultsError("");
    (async () => {
      try {
        const storedId = (
          localStorage.getItem("examStudentId") ||
          localStorage.getItem("studentId") ||
          ""
        ).trim();
        let resolvedId = storedId;
        try {
          const { data: profileRes } = await studentApi.profile();
          if (profileRes?.success && profileRes?.data) {
            const incoming = profileRes.data;
            const preferred = String(
              incoming.rollNumber || incoming.studentId || ""
            ).trim();
            if (preferred) {
              localStorage.setItem("examStudentId", preferred);
              resolvedId = preferred;
            }
          }
        } catch {}
        if (!resolvedId) {
          if (!cancelled) {
            setRecentResults([]);
            setResultsLoading(false);
          }
          return;
        }
        const { data } = await olympiadExamApi.attempts({
          studentId: resolvedId,
          includeMock: 1,
        });
        if (!cancelled) {
          if (data.success) setRecentResults(data.data || []);
          else setResultsError(data.message || "Failed to load results");
        }
      } catch (e) {
        if (!cancelled)
          setResultsError(e.response?.data?.message || "Failed to load results");
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FFF3C4] rounded-full opacity-60 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#FFEBD0] rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-[#FFE0D9] rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Official Socials ───────────────────────────────────────────── */}
        <div className="bg-white/90 border border-[#FFE6A3] rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#B8860B] mb-0.5">Connect</p>
          <h2 className="text-sm font-bold text-gray-900">Official Socials</h2>
          <p className="text-xs text-gray-500 mt-0.5">Follow @TheTrueTopper for updates & resources.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { platform: "youtube",   label: "YouTube",     Icon: FaYoutube,    color: "text-red-600"  },
              { platform: "instagram", label: "Instagram",   Icon: FaInstagram,  color: "text-pink-600" },
              { platform: "linkedin",  label: "LinkedIn",    Icon: FaLinkedinIn, color: "text-sky-700"  },
              { platform: "x",         label: "X (Twitter)", Icon: FaTwitter,    color: "text-gray-800" },
            ].map(({ platform, label, Icon, color }) => (
              <button
                key={platform}
                onClick={() => openSocialModal(platform)}
                className={`flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] hover:bg-[#FFF3C4] px-3 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm ${color}`}
              >
                <Icon className="text-sm" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Usage Analytics ────────────────────────────────────────────── */}
        <div className="bg-white/90 border border-[#FFE6A3] rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#B8860B] mb-0.5">Analytics</p>
          <h2 className="text-sm font-bold text-gray-900">Usage Stats</h2>
          <p className="text-xs text-gray-500 mt-0.5">Time tracked across website & social media.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl bg-[#FFF9E6] border border-[#FFE6A3] p-3 text-center">
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mb-1">Social Media</p>
              <p className="text-lg font-bold text-gray-800">{formatMs(activityStats.socialTotalMs)}</p>
            </div>
            <div className="rounded-xl bg-[#FFF9E6] border border-[#FFE6A3] p-3 text-center">
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mb-1">Website</p>
              <p className="text-lg font-bold text-gray-800">{formatMs(activityStats.websiteTotalMs)}</p>
            </div>
            <div className="rounded-xl bg-[#FFEBB5] border border-[#FFD765] p-3 text-center">
              <p className="text-[9px] font-bold tracking-widest uppercase text-amber-800 mb-1">Combined</p>
              <p className="text-lg font-bold text-amber-900">{formatMs(activityStats.combinedTotalMs)}</p>
            </div>
          </div>
        </div>

        {/* ── Available Olympiads ────────────────────────────────────────── */}
        <div className="bg-white/90 border border-[#FFE6A3] rounded-2xl shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#B8860B] mb-0.5">Examination</p>
              <h2 className="text-sm font-bold text-gray-900">Available Olympiads</h2>
              <p className="text-xs text-gray-500 mt-0.5">Start your exam directly from here.</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleManualRefresh}
                disabled={examRefreshing}
                className="text-xs px-3 py-1.5 rounded-full border border-[#FFD765] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {examRefreshing ? "Refreshing…" : "↻ Refresh"}
              </button>
              <button
                onClick={() => navigate("/student/exam")}
                className="text-xs px-3 py-1.5 rounded-full border border-[#FFD765] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition font-medium"
              >
                View All →
              </button>
            </div>
          </div>

          {examLoading ? (
            <div className="py-10 text-center">
              <div className="w-5 h-5 border-2 border-[#FFD765] border-t-[#B8860B] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Loading exams…</p>
            </div>
          ) : examError ? (
            <p className="py-8 text-center text-xs text-red-500">{examError}</p>
          ) : examList.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">No exams available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {examList.map((exam) => {
                const isStudentPaid    = !!exam?.isStudentPaid;
                const canStartExam     = !!exam?.canStartExam;
                const hasMocks         = !!exam?.hasMocks;
                const paymentAmount    = Number(exam?.payment?.amount) || 0;
                const paymentDate      = exam?.payment?.paidAt || null;
                const startReason      = !isStudentPaid
                  ? "Payment required"
                  : !exam?.isPaymentValidityActive
                  ? "10-day validity expired"
                  : !exam?.isExamWindowActive
                  ? "Exam time window inactive"
                  : "";

                const showPayment  = !!expandedSections[`${exam.examCode}::payment`];
                const showValidity = !!expandedSections[`${exam.examCode}::validity`];

                return (
                  <div
                    key={exam.examCode}
                    className="relative h-full rounded-2xl border border-[#FFE6A3] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    {/* Accent bar */}
                    <div className="h-[3px] w-full bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00]" />

                    <div className="p-4 h-full flex flex-col gap-3">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            {exam.title || exam.examCode}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${
                              isStudentPaid
                                ? "bg-green-50 text-green-700 border-green-200 animate-pulse"
                                : "bg-red-50 text-red-600 border-red-200"
                            }`}
                          >
                            {isStudentPaid ? "PAID" : "UNPAID"}
                          </span>
                        </div>
                      </div>

                      {/* Key exam info */}
                      <div className="rounded-xl bg-[#FFFDF5] border border-[#FFE6A3] px-3 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="text-[11px]">
                          <span className="text-gray-500">Exam Code</span>
                          <p className="font-bold text-gray-900 leading-tight mt-0.5">{exam.examCode}</p>
                        </div>
                        <div className="text-[11px]">
                          <span className="text-gray-500">Time</span>
                          <p className="font-bold text-gray-900 leading-tight mt-0.5">{exam.totalTimeMinutes || 60} min</p>
                        </div>
                        <div className="text-[11px]">
                          <span className="text-gray-500">Total Questions</span>
                          <p className="font-bold text-gray-900 leading-tight mt-0.5">{exam.totalQuestions || 0}</p>
                        </div>
                      </div>

                      {/* Registered + Toggle controls in one line */}
                      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-0.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-[#FFFDF5] border border-[#FFE6A3] rounded-full px-2.5 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFCD2C]" />
                          {Number(exam.totalRegisteredPaidStudents) || 0} registered
                        </span>
                        {[
                          { key: "payment",  label: "Payment"   },
                          { key: "validity", label: "Validity"  },
                        ].map(({ key, label }) => {
                          const isOpen = !!expandedSections[`${exam.examCode}::${key}`];
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => toggleExamSection(exam.examCode, key)}
                              className={`flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-3 py-1.5 border transition-all ${
                                isOpen
                                  ? "bg-[#FFF3C4] border-[#FFD765] text-gray-900"
                                  : "bg-[#FFFDF5] border-[#FFE6A3] text-gray-700 hover:bg-[#FFF3C4]"
                              }`}
                            >
                              {label}
                              <ChevronIcon open={isOpen} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Payment detail */}
                      {showPayment && (
                        <div className="rounded-xl bg-[#FFFDF5] border border-[#FFE6A3] px-3 py-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-bold ${isStudentPaid ? "text-green-700" : "text-red-600"}`}>
                              {isStudentPaid ? "✓ Paid" : "✗ Not Paid"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-semibold text-gray-900">{isStudentPaid ? `₹${paymentAmount}` : "—"}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Paid At</span>
                            <span className="font-semibold text-gray-900">{formatDateTime(paymentDate)}</span>
                          </div>
                        </div>
                      )}

                      {/* Validity detail */}
                      {showValidity && (
                        <div className="rounded-xl bg-[#FFFDF5] border border-[#FFE6A3] px-3 py-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Available From</span>
                            <span className="font-semibold text-gray-900">{formatDateOnly(exam.paymentAvailableFrom)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Valid Till</span>
                            <span className="font-semibold text-gray-900">{formatDateOnly(exam.paymentValidTill)}</span>
                          </div>
                        </div>
                      )}

                      {/* Disabled reason */}
                      {startReason && (
                        <div className="flex items-center gap-2 text-[10px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <span>⚠</span> {startReason}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1 mt-auto">
                        <button
                          onClick={() => {
                            if (!canStartExam) return;
                            const code = String(exam.examCode || "").trim();
                            if (!code) return;
                            localStorage.setItem("examCode", code);
                            localStorage.removeItem("examMockTestCode");
                            navigate("/student/exam");
                          }}
                          disabled={!canStartExam}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            canStartExam
                              ? "bg-[#FFCD2C] text-gray-900 hover:bg-[#FFC107] shadow-sm hover:shadow-md hover:-translate-y-0.5"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {canStartExam && "▶"} Start Exam
                        </button>
                        {hasMocks && (
                          <button
                            type="button"
                            onClick={() => openMocksForExam(exam)}
                            className="px-4 py-2 rounded-full border border-[#FFE6A3] bg-[#FFFDF5] hover:bg-[#FFF3C4] text-xs font-semibold text-gray-800 transition-all"
                          >
                            Mock Tests
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent Test Results ────────────────────────────────────────── */}
        <div className="bg-white/90 border border-[#FFE6A3] rounded-2xl shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#B8860B] mb-0.5">History</p>
              <h2 className="text-sm font-bold text-gray-900">Recent Test Results</h2>
              <p className="text-xs text-gray-500 mt-0.5">Your latest exam attempts.</p>
            </div>
            <button
              onClick={() =>
                recentResults.length > 0
                  ? navigate(`/student/result/${recentResults[0].attemptId}`)
                  : navigate("/student/result")
              }
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-[#FFD765] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition font-medium"
            >
              Full History →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b-2 border-[#FFE6A3]">
                  {["Exam", "Date", "Score", "Attempted / Skipped", "Correct / Wrong", "Action"].map((h) => (
                    <th key={h} className="py-2.5 px-3 text-left text-[9.5px] font-bold tracking-widest uppercase text-[#B8860B] first:pl-0 last:pr-0 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="w-5 h-5 border-2 border-[#FFD765] border-t-[#B8860B] rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Loading results…</p>
                    </td>
                  </tr>
                ) : resultsError ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-red-500">{resultsError}</td>
                  </tr>
                ) : recentResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-gray-400">No attempts yet.</td>
                  </tr>
                ) : (
                  recentResults.map((res) => (
                    <tr key={res.attemptId} className="border-b border-[#FFF3C4] hover:bg-[#FFFDF5] transition-colors">
                      <td className="py-3 pr-3 pl-0">
                        <span className="font-bold text-gray-900">{res.examCode}</span>
                        {res.mockTestCode && (
                          <span className="ml-2 text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5">
                            Mock: {res.mockTestCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {res.createdAt ? new Date(res.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">{res.totalMarks}</td>
                      <td className="py-3 px-3 text-gray-600">{res.attemptedCount} / {res.skippedCount}</td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-700 font-semibold">{res.correctCount}</span>
                        <span className="text-gray-300 mx-1">|</span>
                        <span className="text-red-600 font-semibold">{res.wrongCount}</span>
                      </td>
                      <td className="py-3 pl-3 pr-0">
                        <button
                          onClick={() => navigate(`/student/result/${res.attemptId}`)}
                          className="text-[11px] font-semibold text-[#B8860B] hover:text-amber-900 hover:underline transition-colors"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <div className="bg-white/90 border border-[#FFE6A3] rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#B8860B] mb-0.5">Shortcuts</p>
          <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h2>
          <button
            onClick={() =>
              recentResults.length > 0
                ? navigate(`/student/result/${recentResults[0].attemptId}`)
                : navigate("/student/result")
            }
            className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] hover:bg-[#FFF3C4] px-4 py-3 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-sky-400 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                H
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-900">Test History</p>
                <p className="text-[10px] text-gray-500">View all your past exam attempts</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-700 text-base transition-colors">›</span>
          </button>
        </div>

      </div>

      {/* Social Modal */}
      <SocialMediaLinkModal
        open={isModalOpen}
        onClose={handleModalClose}
        platform={selectedPlatform}
        studentId={studentId}
      />

      {/* Mock Tests Modal */}
      {mockModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeMockModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#FFE6A3] bg-[#FFFDF5]">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Mock Tests</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {selectedExamForMocks?.title || selectedExamForMocks?.examCode}
                </p>
              </div>
              <button
                onClick={closeMockModal}
                className="w-8 h-8 rounded-lg bg-[#FFF9E6] border border-[#FFE6A3] hover:bg-[#FFEBB5] flex items-center justify-center text-gray-500 hover:text-gray-900 transition text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-5 max-h-96 overflow-y-auto space-y-3">
              {mockLoading ? (
                <div className="py-8 text-center">
                  <div className="w-5 h-5 border-2 border-[#FFD765] border-t-[#B8860B] rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Loading mock tests…</p>
                </div>
              ) : mockError ? (
                <p className="py-6 text-center text-xs text-red-500">{mockError}</p>
              ) : mockTests.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">No mock tests found.</p>
              ) : (
                mockTests.map((mock) => (
                  <div
                    key={mock.mockTestCode}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-4 py-3 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{mock.mockTitle || mock.mockTestCode}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Code: {mock.mockTestCode} &bull; {mock.questionCount || 0} Qs &bull;{" "}
                        {mock.mockTime || selectedExamForMocks?.totalTimeMinutes || 60} min
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedExamForMocks) return;
                        const code = String(selectedExamForMocks.examCode || "").trim();
                        const mockCode = String(mock.mockTestCode || "").trim();
                        if (!code || !mockCode) return;
                        localStorage.setItem("examCode", code);
                        localStorage.setItem("examMockTestCode", mockCode);
                        navigate(
                          `/student/exam?examCode=${encodeURIComponent(code)}&mockTestCode=${encodeURIComponent(mockCode)}`
                        );
                        closeMockModal();
                      }}
                      className="flex-shrink-0 px-4 py-2 rounded-full bg-[#FFCD2C] hover:bg-[#FFC107] text-gray-900 text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Start →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}