"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputRefs = useRef([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next box automatically
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOTP = otp.join(""); // Combine into single string
    if (enteredOTP.length < 5) {
      alert("Please enter full 5-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `https://authflow-kappa.vercel.app/api/v1/user/verifyOTP`,
        { otp: enteredOTP }
      );

      alert("OTP Verified Successfully!");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md p-8 bg-white/10 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center">
          🔒 Verify OTP
        </h1>
        <p className="text-gray-300 text-center mb-6 text-sm">
          Enter the 5-digit code sent to your email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Boxes */}
          <div className="flex justify-between gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-gray-800 text-white 
                border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 
            text-white font-semibold shadow-lg hover:scale-105 transition transform duration-200 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-5 text-sm">
          Didn’t get the code?{" "}
          <button
            type="button"
            onClick={() => alert("Resend OTP feature here")}
            className="text-purple-400 hover:underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
