"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/login`,
        { email, password }
      );

      alert("Login Successful!");
      console.log(res.data);

      // Store JWT in localStorage
      localStorage.setItem("token", res.data.token);

      // Redirect to dashboard or home page
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mb-6">
            Authentication System
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Secure, modern, and beautiful login experience built with{" "}
            <span className="font-semibold text-blue-400">Next.js</span> and{" "}
            <span className="font-semibold text-purple-400">Tailwind CSS</span>.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Welcome Back 👋
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="flex items-center rounded-xl bg-gray-800/50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  required
                />
                <Mail className="text-gray-400 ml-2" size={20} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="flex items-center rounded-xl bg-gray-800/50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  required
                />
                <Lock className="text-gray-400 ml-2" size={20} />
              </div>

              <div className="text-right mt-2">
                <a
                  href="./forgetpassword"
                  className="text-sm text-blue-400 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold hover:opacity-90 transition duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-700" />
            <span className="px-3 text-gray-400 text-sm">OR</span>
            <hr className="flex-grow border-gray-700" />
          </div>

  <button
  onClick={() => (window.location.href = "http://localhost:5000/auth/google")}
  className="w-full flex items-center justify-center gap-3 rounded-xl bg-white py-3 text-gray-800 font-semibold hover:bg-gray-200 transition duration-200 shadow-md"
>
  <img
    src="https://www.svgrepo.com/show/355037/google.svg"
    alt="Google"
    className="w-5 h-5"
  />
  Continue with Google
</button>


          {/* Footer */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            Don’t have an account?{" "}
            <a href="./signup" className="text-blue-400 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
