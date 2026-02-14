import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const message =
    location.state?.message || "Registration successful with payment.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
      <div className="balloon-layer">
        <div className="balloon balloon-1" />
        <div className="balloon balloon-2" />
        <div className="balloon balloon-3" />
        <div className="balloon balloon-4" />
        <div className="balloon balloon-5" />
        <div className="balloon balloon-6" />
        <div className="balloon balloon-7" />
        <div className="balloon balloon-8" />
        <div className="balloon balloon-9" />
        <div className="balloon balloon-10" />
      </div>

      <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white p-8 shadow-xl text-center animate-scale-in">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Congratulations!
        </h1>
        <p className="mt-2 text-gray-600">
          Your registration is done.
        </p>

        <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-gray-700">
          {message}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-lg bg-green-600 text-white"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
