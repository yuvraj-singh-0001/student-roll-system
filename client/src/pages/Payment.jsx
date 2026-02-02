import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fakePay } from "../api";

export default function Payment() {
  const navigate = useNavigate();
  const [step, setStep] = useState("idle"); // idle | processing | success
  const [acceptedTC, setAcceptedTC] = useState(false);

  const userId = localStorage.getItem("userId");

  const studentId = localStorage.getItem("studentId");
  const studentName = localStorage.getItem("studentName");
  const studentEmail = localStorage.getItem("studentEmail");
  const studentRoll = localStorage.getItem("studentRoll");

  const startPayment = async () => {
    if (!userId) {
      console.error("No userId in localStorage");
      return;
    }

    setStep("processing");

    setTimeout(async () => {
      try {
        const res = await fakePay(userId); // { success, message, user }

        if (res.success) {
          const updatedUser = res.user;

          // user ko paid + logged in treat karo
          if (updatedUser) {
            // agar real token nahi bhej rahe ho to yeh placeholder bhi chalega
            localStorage.setItem("token", "fake-token-after-payment");
            localStorage.setItem("userId", updatedUser._id || updatedUser.id);
            localStorage.setItem("isPaid", true);
          } else {
            localStorage.setItem("isPaid", true);
          }

          // ✅ payment ke turant baad Student Dashboard
          navigate("/student");
          return;
        } else {
          console.error("payment failed:", res.message);
          setStep("idle");
        }
      } catch (err) {
        console.error("payment error:", err);
        setStep("idle");
      }
    }, 2500);
  };

  const handleStartExam = () => {
    if (!acceptedTC) return;

    if (studentId) {
      localStorage.setItem("examStudentId", studentId);
      navigate("/student/exam");
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Secure Payment</h2>
            <p className="text-sm opacity-90">Powered by TestEdu Payments</p>
          </div>
          {studentName && (
            <div className="text-right text-xs opacity-90">
              <p className="font-semibold">{studentName}</p>
              {studentEmail && <p>{studentEmail}</p>}
            </div>
          )}
        </div>

        {/* BODY */}
        <div className="p-6">
          {/* Exam info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Exam</span>
              <strong>Olympiad Test Access</strong>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Amount</span>
              <strong>₹499</strong>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>GST</span>
              <strong>Included</strong>
            </div>
          </div>

          {step === "idle" && (
            <button
              onClick={startPayment}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Pay ₹499 Securely
            </button>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Processing payment securely…</p>
              <p className="text-xs text-gray-400">
                Do not refresh or close this page
              </p>
            </div>
          )}

          {/* step === "success" wala UI ab practical me dikhega nahi,
              kyunki success pe hum direct navigate("/student") kar rahe hain.
              Agar future me chahiye ho to navigate se pehle setStep("success") laga sakte ho. */}
          {step === "success" && (
            <div className="space-y-5 py-2">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-green-600">✓</span>
                </div>
                <h3 className="text-lg font-bold text-green-600">
                  Payment Successful
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Your payment has been verified.
                  <br />
                  You can now access the exam.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-xs font-semibold text-emerald-700 mb-2">
                  Student Exam Access Details
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">ID</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Student ID</p>
                    <p className="text-lg font-mono font-bold text-gray-900">
                      {studentId || "N/A"}
                    </p>
                  </div>
                </div>
                {studentRoll && (
                  <p className="text-xs text-gray-700">
                    Roll Number: <span className="font-semibold">{studentRoll}</span>
                  </p>
                )}
                <p className="text-[11px] text-gray-500 mt-2">
                  📝 Save this ID. You will need it to start and submit your exam.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTC}
                    onChange={(e) => setAcceptedTC(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <button
                      type="button"
                      className="text-blue-600 underline underline-offset-2"
                      onClick={() =>
                        alert("Show Terms & Conditions modal here")
                      }
                    >
                      Terms & Conditions
                    </button>{" "}
                    of this Olympiad exam, including rules for cheating,
                    reattempts, and timing.
                  </span>
                </label>

                <button
                  onClick={handleStartExam}
                  disabled={!acceptedTC}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <span>Start Exam Now</span>
                  <span>→</span>
                </button>

                <button
                  onClick={() => navigate("/student")}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 hover:underline underline-offset-2"
                >
                  Go back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 text-xs text-gray-500 flex justify-between">
          <span>🔒 256-bit Secure</span>
          <span>TestEdu Payments</span>
        </div>
      </div>
    </div>
  );
}
