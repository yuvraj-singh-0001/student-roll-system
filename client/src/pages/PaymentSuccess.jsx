import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TTTLogo from "../assets/images/TTTlogo- rigiterions.png";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const message =
    location.state?.message || "Registration successful with payment.";

  useEffect(() => {
    const id = setTimeout(() => {
      navigate("/register-form-b");
    }, 700);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4] px-4">
      <div className="relative z-10 w-[92%] max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl text-center border border-amber-100">
        <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-white shadow-md border border-amber-100 flex items-center justify-center">
          <img
            src={TTTLogo}
            alt="True Topper"
            className="h-14 w-14 animate-spin"
            style={{ animationDuration: "8s" }}
          />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Payment Successful
        </h1>
        <p className="mt-2 text-slate-700">
          Form A completed. Opening Form B next.
        </p>

        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">
          {message}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <p className="text-xs text-slate-500">
            Redirecting to Form B registration...
          </p>
          <button
            onClick={() => navigate("/register-form-b")}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-slate-900 font-semibold shadow-md"
          >
            Open Form B Now
          </button>
        </div>
      </div>
    </div>
  );
}
