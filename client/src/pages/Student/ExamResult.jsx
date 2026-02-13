import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { olympiadExamApi } from "../../api";

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [result, setResult] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state && !!attemptId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state) return;
    if (!attemptId) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const { data } = await olympiadExamApi.attemptDetails(attemptId);
        if (!cancelled) {
          if (data.success) {
            setResult({
              ...data.data,
              detailedAttempts: data.data?.answers || [],
            });
          } else {
            setError(data.message || "Failed to load result");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || "Failed to load result");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId, location.state]);

  const detailedAttempts = result?.detailedAttempts || [];
  const branchChoices = {};
  detailedAttempts.forEach((a) => {
    if (a.type !== "branch_parent") return;
    if (a.selectedAnswer !== "A" && a.selectedAnswer !== "B") return;
    branchChoices[String(a.questionNumber)] = a.selectedAnswer;
  });
  const visibleAttempts = detailedAttempts.filter((a) => {
    if (a.type !== "branch_child") return true;
    if (!a.parentQuestion || !a.branchKey) return true;
    const choice = branchChoices[String(a.parentQuestion)];
    if (!choice) return false;
    return choice === a.branchKey;
  });
  const scoredAttempts = visibleAttempts.filter((a) => a.type !== "branch_parent");
  const total = result?.totalMarks ?? 0;
  const attempted =
    result?.attemptedCount ??
    scoredAttempts.filter((a) => a.status === "attempted").length;
  const skipped =
    result?.skippedCount ??
    scoredAttempts.filter((a) => a.status === "skipped").length;
  const correct =
    result?.correctCount ??
    scoredAttempts.filter((a) => a.isCorrect === true).length;
  const wrong =
    result?.wrongCount ??
    scoredAttempts.filter(
      (a) => a.isCorrect === false && a.status === "attempted"
    ).length;
  const examCode = result?.examCode || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-24 w-72 h-72 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
          <div className="absolute top-32 -left-24 w-72 h-72 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 border-4 border-[#FFCD2C] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 animate-pulse">Loading result...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-24 w-72 h-72 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
          <div className="absolute top-32 -left-24 w-72 h-72 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-2xl shadow-xl border border-[#FFE6A3] p-8 text-center max-w-md animate-fade-in-up backdrop-blur">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-red-600">ERR</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Unable to Load Result
            </h3>
            <p className="text-red-600 mb-6 text-sm">{error}</p>
            <button
              onClick={() => navigate("/student")}
              className="px-6 py-3 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-medium rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 mx-auto"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] overflow-hidden relative">
      {/* background blobs (same family) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-24 w-72 h-72 bg-[#FFE6A3] rounded-full blur-3xl animate-blob" />
        <div className="absolute top-32 -left-24 w-72 h-72 bg-[#FFEBD0] rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* main card */}
      <main className="relative z-10 max-w-none mx-auto px-4 py-4">
        <div className="bg-white/95 rounded-2xl shadow-xl border border-[#FFE6A3] overflow-hidden animate-scale-in backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-[#FFCD2C] to-emerald-400" />
          <div className="p-4 sm:p-5">
            {/* Success icon */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center animate-fade-in shadow-md">
                <span className="text-sm font-bold text-emerald-600">OK</span>
              </div>
            </div>

            {/* message */}
            <div className="text-center space-y-1.5 animate-fade-in-up delay-1">
              <h2 className="text-xl font-bold text-gray-900">
                Exam submitted successfully
              </h2>
              <p className="text-gray-600 leading-relaxed text-xs">
                Your paper has been evaluated. Summary and details are below.
              </p>
            </div>

            {/* score card */}
            <div className="mt-3 p-3 bg-[#FFF9E6] rounded-xl border border-[#FFE6A3] animate-fade-in-up delay-2">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Total score
              </p>
              <p className="text-3xl font-bold text-emerald-600">{total}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                <span>
                  Attempted:{" "}
                  <span className="font-semibold text-gray-900">
                    {attempted}
                  </span>
                </span>
                <span>
                  Skipped:{" "}
                  <span className="font-semibold text-gray-900">
                    {skipped}
                  </span>
                </span>
                <span>
                  Correct:{" "}
                  <span className="font-semibold text-emerald-700">
                    {correct}
                  </span>
                </span>
                <span>
                  Wrong:{" "}
                  <span className="font-semibold text-red-700">{wrong}</span>
                </span>
              </div>
            </div>

            {/* detailed review */}
            {visibleAttempts.length > 0 && (
              <div className="mt-3 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Question Review
                </h3>
                {visibleAttempts.map((d, idx) => {
                  const isSkipped =
                    d.status === "skipped" || d.status === "not_visited";
                  const isCorrect = d.isCorrect === true;
                  const isNeutral = !isSkipped && d.isCorrect === null;
                  const borderClass = isSkipped
                    ? "border-amber-200 bg-amber-50"
                    : isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : isNeutral
                    ? "border-slate-200 bg-slate-50"
                    : "border-rose-200 bg-rose-50";

                  const selectedText =
                    d.type === "multiple"
                      ? (d.selectedAnswers || []).join(", ") || "-"
                      : d.selectedAnswer || "-";
                  const correctText =
                    d.type === "multiple"
                      ? (d.correctAnswers || []).join(", ") || "-"
                      : d.correctAnswer || "-";

                  return (
                    <div
                      key={`${d.questionNumber}-${idx}`}
                      className={`rounded-xl border p-2 ${borderClass}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            Q{d.questionNumber}{" "}
                            <span className="text-[11px] text-gray-500">
                              ({d.type})
                            </span>
                          </p>
                          <p className="text-xs text-gray-800">
                            {d.questionText || "-"}
                          </p>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                            isSkipped
                              ? "bg-amber-100 text-amber-800"
                              : isCorrect
                              ? "bg-emerald-100 text-emerald-800"
                              : isNeutral
                              ? "bg-slate-100 text-slate-700"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isSkipped
                            ? "Skipped"
                            : isCorrect
                            ? "Correct"
                            : isNeutral
                            ? d.type === "branch_parent"
                              ? "No Marks"
                              : "Attempted"
                            : "Wrong"}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-[10px] text-gray-700">
                        <div>
                          <span className="text-gray-600">Your Answer: </span>
                          <span className="font-medium">{selectedText}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Correct Answer: </span>
                          <span className="font-medium">{correctText}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Marks: </span>
                          <span className="font-semibold">{d.marks}</span>
                        </div>
                        {d.type === "confidence" && d.confidence && (
                          <div>
                            <span className="text-gray-600">Confidence: </span>
                            <span className="font-medium">{d.confidence}</span>
                          </div>
                        )}
                      </div>
                      {d.marksReason && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          {d.marksReason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* actions */}
            <div className="mt-4 flex flex-col gap-2 animate-fade-in-up delay-3">
              <button
                onClick={() => navigate("/student/exam")}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-gray-900 font-semibold shadow-lg hover:shadow-amber-300/80 hover:-translate-y-[1px] transition"
              >
                Take Exam Again
              </button>
              <button
                onClick={() => navigate("/student")}
                className="w-full py-3 px-4 bg-white/90 text-gray-800 font-semibold rounded-xl border border-[#FFE6A3] hover:bg-[#FFF3C4] transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




