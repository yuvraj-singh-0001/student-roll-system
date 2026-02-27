import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { olympiadExamApi, examApi, studentApi, questionApi } from "../../api";

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
      JSON.stringify({ data: Array.isArray(list) ? list : [], ts: Date.now() }),
    );
  } catch {
    // ignore cache write errors
  }
};
import {
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import useActivityTracker from "../../hooks/useActivityTracker";
import SocialMediaLinkModal from "../../components/SocialMediaLinkModal";
import { activityApi } from "../../api";

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

  // Mock tests modal state
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [mockError, setMockError] = useState("");
  const [selectedExamForMocks, setSelectedExamForMocks] = useState(null);
  const [mockTests, setMockTests] = useState([]); // { mockTestCode, questionCount }

  // Activity Tracking state
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
          if (res && res.data && res.data.success) {
            setActivityStats(
              res.data.data || {
                socialTotalMs: 0,
                websiteTotalMs: 0,
                combinedTotalMs: 0,
              },
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
    if (min === 0) return `${sec} sec`;
    return `${min} min ${sec} sec`;
  };

  const availableTests = examList;

  const fetchExamList = useCallback(async (options = {}) => {
    const silent = options.silent === true;
    const forceRefresh = options.forceRefresh === true;

    if (fetchingRef.current || cancelledRef.current) return;
    fetchingRef.current = true;

    const cachedNow = readExamListCache({ allowStale: true });
    const hasCacheNow =
      Array.isArray(cachedNow?.data) && cachedNow.data.length > 0;

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
      if (!cancelledRef.current && !silent && !hasCacheNow) {
        setExamError(e.response?.data?.message || "Failed to load exams");
      }
    } finally {
      if (!cancelledRef.current) {
        if (!silent && !hasCacheNow) setExamLoading(false);
        if (forceRefresh) setExamRefreshing(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  const openMocksForExam = async (exam) => {
    if (!exam || !exam.examCode) return;
    setSelectedExamForMocks(exam);
    setMockModalOpen(true);
    setMockError("");
    setMockTests([]);
    try {
      setMockLoading(true);
      // backend se given examCode ke liye saare mock tests lao
      const { data } = await questionApi.mocks({ examCode: exam.examCode });
      if (data?.success) {
        setMockTests(data.data || []);
      } else {
        setMockError(data?.message || "Failed to load mock tests");
      }
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

  // recent results will be loaded from backend

  useEffect(() => {
    cancelledRef.current = false;
    const cachedFresh = readExamListCache();
    const cachedStale = cachedFresh
      ? null
      : readExamListCache({ allowStale: true });
    const activeCache = cachedFresh || cachedStale;
    const hasCache =
      Array.isArray(activeCache?.data) && activeCache.data.length > 0;
    if (hasCache) setExamList(activeCache.data);
    setExamLoading(!hasCache);
    setExamError("");

    if (!hasCache) {
      fetchExamList({ silent: false });
    } else if (activeCache?.isStale) {
      fetchExamList({ silent: true });
    }

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
              incoming.rollNumber || incoming.studentId || "",
            ).trim();
            if (preferred) {
              localStorage.setItem("examStudentId", preferred);
              resolvedId = preferred;
            }
          }
        } catch {
          // ignore profile errors
        }

        if (!resolvedId) {
          if (!cancelled) {
            setRecentResults([]);
            setResultsLoading(false);
          }
          return;
        }

        const { data } = await olympiadExamApi.attempts({
          studentId: resolvedId,
        });
        if (!cancelled) {
          if (data.success) {
            setRecentResults(data.data || []);
          } else {
            setResultsError(data.message || "Failed to load results");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setResultsError(
            e.response?.data?.message || "Failed to load results",
          );
        }
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] text-gray-900 overflow-hidden relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-24 w-80 h-80 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-5rem] left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFE0D9] rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* MAIN */}
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Social Links */}
          <section className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Official Socials
                </h3>
                <p className="text-[11px] text-gray-600">
                  Follow The True Topper for updates and resources.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500">
                @TheTrueTopper
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => openSocialModal("youtube")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-red-600 hover:bg-[#FFF3C4] transition"
              >
                <FaYoutube className="text-sm" />
                YouTube
              </button>
              <button
                onClick={() => openSocialModal("instagram")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-pink-600 hover:bg-[#FFF3C4] transition"
              >
                <FaInstagram className="text-sm" />
                Instagram
              </button>
              <button
                onClick={() => openSocialModal("linkedin")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-sky-700 hover:bg-[#FFF3C4] transition"
              >
                <FaLinkedinIn className="text-sm" />
                LinkedIn
              </button>
              <button
                onClick={() => openSocialModal("x")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 text-xs font-medium text-gray-800 hover:bg-[#FFF3C4] transition"
              >
                <FaTwitter className="text-sm" />X (Twitter)
              </button>
            </div>
          </section>

          {/* Activity Stats Section */}
          <section className="rounded-2xl bg-gradient-to-r from-[#FFFDF5] to-[#fff] border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Usage Analytics
              </h3>
              <p className="text-[11px] text-gray-600">
                Track the time you spend on our website and linked social media.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-[#FFF9E6] border border-[#FFE6A3] rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase font-semibold">
                  Social Media
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatMs(activityStats.socialTotalMs)}
                </p>
              </div>
              <div className="bg-[#FFF9E6] border border-[#FFE6A3] rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase font-semibold">
                  Website Time
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatMs(activityStats.websiteTotalMs)}
                </p>
              </div>
              <div className="bg-[#FFEBB5] border border-[#FFD765] rounded-xl p-3 shadow-inner">
                <p className="text-[10px] text-amber-800 uppercase font-semibold">
                  Combined Total
                </p>
                <p className="text-lg font-bold text-amber-900">
                  {formatMs(activityStats.combinedTotalMs)}
                </p>
              </div>
            </div>
          </section>

          {/* SECOND ROW: Available Tests & Recent Results */}
          <section className="grid gap-4">
            {/* Available Tests */}
            <div className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Available Tests
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Start your exam directly from here.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualRefresh}
                    disabled={examRefreshing}
                    className={`text-[11px] px-3 py-1.5 rounded-full border border-[#FFD765] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition ${
                      examRefreshing ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {examRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    onClick={() => navigate("/student/exam")}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-[#FFD765] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {examLoading ? (
                  <div className="py-6 text-center text-xs text-gray-500 sm:col-span-2">
                    Loading exams...
                  </div>
                ) : examError ? (
                  <div className="py-6 text-center text-xs text-red-600 sm:col-span-2">
                    {examError}
                  </div>
                ) : availableTests.length > 0 ? (
                  availableTests.slice(0, 4).map((exam) => (
                    <div
                      key={exam.examCode}
                      className="group relative overflow-hidden rounded-2xl border border-[#FFE1B5] bg-white/95 shadow-sm hover:shadow-md transition"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-br from-[#FFF3C4]/60 via-transparent to-[#FFE0D9]/70" />
                      <div className="relative p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-amber-700/80">
                              Exam Paper
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {exam.title || exam.examCode}
                            </p>
                            <p className="text-[11px] text-gray-600">
                              Code: {exam.examCode} | Time:{" "}
                              {exam.totalTimeMinutes || 60} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openMocksForExam(exam)}
                            className="flex-1 text-[11px] border border-[#FFE6A3] text-amber-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] py-1.5 rounded-lg transition font-medium"
                          >
                            Mock Tests
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/student/olympiad/${exam.examCode}`)
                            }
                            className="flex-1 text-[11px] bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded-lg font-medium transition shadow-sm"
                          >
                            Start Exam
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 sm:col-span-2">
                    No exams available.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Results */}
            <div className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Recent Test Results
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Your latest exam attempts.
                  </p>
                </div>
                <button
                  onClick={() =>
                    recentResults.length > 0
                      ? navigate(
                          `/student/result/${recentResults[0].attemptId}`,
                        )
                      : navigate("/student/result")
                  }
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[#FFE6A3] text-gray-800 bg-[#FFF9E6] hover:bg-[#FFEBB5] transition"
                >
                  Full History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead className="text-gray-600">
                    <tr className="border-b border-[#FFE6A3]">
                      <th className="py-2 pr-3 text-left font-medium">
                        Exam Code
                      </th>
                      <th className="py-2 px-3 text-left font-medium">Date</th>
                      <th className="py-2 px-3 text-left font-medium">Score</th>
                      <th className="py-2 px-3 text-left font-medium">
                        Attempted / Skipped
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Correct / Wrong
                      </th>
                      <th className="py-2 pl-3 text-left font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-gray-500"
                        >
                          Loading results...
                        </td>
                      </tr>
                    ) : resultsError ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-red-600"
                        >
                          {resultsError}
                        </td>
                      </tr>
                    ) : recentResults.length > 0 ? (
                      recentResults.map((res) => (
                        <tr
                          key={res.attemptId}
                          className="border-b border-[#FFF1CC] hover:bg-[#FFF9E6]"
                        >
                          <td className="py-2 pr-3 font-medium">
                            {res.examCode}
                          </td>
                          <td className="py-2 px-3">
                            {res.createdAt
                              ? new Date(res.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-2 px-3">{res.totalMarks}</td>
                          <td className="py-2 px-3">
                            {res.attemptedCount} / {res.skippedCount}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-emerald-700 font-medium">
                              {res.correctCount} correct
                            </span>
                            <span className="text-gray-400"> | </span>
                            <span className="text-red-700 font-medium">
                              {res.wrongCount} wrong
                            </span>
                          </td>
                          <td className="py-2 pl-3">
                            <button
                              onClick={() =>
                                navigate(`/student/result/${res.attemptId}`)
                              }
                              className="text-[11px] text-amber-700 hover:text-amber-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-gray-500"
                        >
                          No attempts yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white/90 border border-[#FFE6A3] backdrop-blur-xl p-4 shadow-md">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                Quick Actions
              </h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() =>
                    recentResults.length > 0
                      ? navigate(
                          `/student/result/${recentResults[0].attemptId}`,
                        )
                      : navigate("/student/result")
                  }
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#FFE6A3] bg-[#FFFDF5] px-3 py-2 hover:bg-[#FFF3C4] transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-sky-400 flex items-center justify-center text-[10px] font-bold text-white">
                      H
                    </span>
                    <span className="text-gray-800">
                      Test History
                      <p className="text-[10px] text-gray-600">
                        View past test attempts.
                      </p>
                    </span>
                  </span>
                  <span className="text-gray-400">{">"}</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        <SocialMediaLinkModal
          open={isModalOpen}
          onClose={handleModalClose}
          platform={selectedPlatform}
          studentId={studentId}
        />

        {/* Modal: list of mock tests for selected exam */}
        {mockModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Mock Tests
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {selectedExamForMocks?.title ||
                      selectedExamForMocks?.examCode}
                  </p>
                </div>
                <button
                  onClick={closeMockModal}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Close
                </button>
              </div>

              {mockLoading ? (
                <div className="py-4 text-center text-xs text-gray-500">
                  Loading mock tests...
                </div>
              ) : mockError ? (
                <div className="py-4 text-center text-xs text-red-600">
                  {mockError}
                </div>
              ) : mockTests.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-500">
                  No mock tests found for this exam.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockTests.map((mock) => (
                    <div
                      key={mock.mockTestCode}
                      className="flex items-center justify-between rounded-xl border border-[#FFE1B5] bg-[#FFFDF5] px-3 py-2"
                    >
                      <div className="text-[11px] text-gray-700">
                        <div className="font-semibold text-gray-900">
                          {mock.mockTestCode}
                        </div>
                        <div>Questions: {mock.questionCount || 0}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedExamForMocks) return;
                          // Start selected mock test on OlympiadExamPage
                          navigate(
                            `/student/olympiad/${selectedExamForMocks.examCode}?mockTestCode=${encodeURIComponent(
                              mock.mockTestCode,
                            )}`,
                          );
                          closeMockModal();
                        }}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-[#FFCD2C] text-gray-900 font-semibold hover:bg-[#FFC107] transition"
                      >
                        Start Mock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
