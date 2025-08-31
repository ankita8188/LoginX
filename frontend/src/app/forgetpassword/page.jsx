"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        // redirect after 3 seconds
        router.push(`/resetpassword/${token}`);

        // OR if API returns token -> router.push(`/resetpassword/${token}`)       jo link aaa rhi h usme localhost likjha aa rha h vha pe url da
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/password/forgot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );

      const data = await res.json();
      setMessage(data.message || "Check your email for reset link.");

      setShouldRedirect(true);
    } catch (err) {
      setMessage("Something went wrong!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-gray-900/80 p-8 shadow-2xl backdrop-blur-xl border border-blue-400/30">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Forgot Password 🔑
        </h2>

        {message && (
          <p className="text-center text-blue-400 text-sm mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-3 text-white font-semibold hover:opacity-90 transition duration-300 shadow-lg"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Remembered your password?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Go back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
