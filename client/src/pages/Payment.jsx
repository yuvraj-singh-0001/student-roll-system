import { useState } from "react";
import { fakePay } from "../api";

export default function Payment() {
  const [step, setStep] = useState("idle"); // idle | processing | success
  const userId = localStorage.getItem("userId");

  const startPayment = async () => {
    setStep("processing");

    // REAL FEEL DELAY (like Razorpay)
    setTimeout(async () => {
      const res = await fakePay(userId);
      if (res.success) {
        setStep("success");
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-xl font-bold">Secure Payment</h2>
          <p className="text-sm opacity-90">Powered by TestEdu Payments</p>
        </div>

        {/* BODY */}
        <div className="p-6">
          {/* COURSE INFO */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Course</span>
              <strong>Full Stack Development</strong>
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

          {/* PAYMENT STATES */}
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
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">
                Processing payment securely…
              </p>
              <p className="text-xs text-gray-400">
                Do not refresh or close this page
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl text-green-600">✓</span>
              </div>
              <h3 className="text-lg font-bold text-green-600">
                Payment Successful
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Your payment has been verified.<br />
                You can now access exams.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 text-xs text-gray-500 flex justify-between">
          <span>🔒 256-bit Secure</span>
          <span>TestEdu Payments</span>
        </div>
      </div>
    </div>
  );
}
