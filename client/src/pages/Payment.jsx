import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { makePayment } from "../api";

export default function Payment() {
  const navigate = useNavigate();
  const [step, setStep] = useState("idle");

  const startPayment = async () => {
    setStep("processing");

    try {
      const res = await makePayment({
        paymentId: "FAKE12345",
        amount: 499
      });

      if (res.success) {
        alert(res.message);
        navigate("/"); // ya success page
      } else {
        setStep("idle");
        alert(res.message);
      }
    } catch {
      setStep("idle");
      alert("Payment failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">

        <h2 className="text-xl font-bold mb-6">Olympiad Registration Payment</h2>

        {step === "idle" && (
          <button
            onClick={startPayment}
            className="w-full py-3 bg-green-600 text-white rounded-lg"
          >
            Pay ₹499
          </button>
        )}

        {step === "processing" && (
          <p className="text-center">Processing Payment...</p>
        )}

      </div>
    </div>
  );
}
