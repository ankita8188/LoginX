"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ Check if token is in URL (Google OAuth redirect)
        const urlToken = searchParams.get("token");
        if (urlToken) {
          localStorage.setItem("token", urlToken);
        }

        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await axios.post(
          "http://localhost:5000/api/v1/user/me",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(res.data.user);
      } catch (error) {
        console.error("Fetch user failed:", error.response?.data || error.message);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, searchParams]);

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5000/api/v1/user/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    } finally {
      localStorage.removeItem("token"); // clear token anyway
      router.push("/login"); // redirect to login
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (!user) return <p className="text-center mt-10 text-red-500">Not authenticated...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-10 w-full max-w-md text-center border border-gray-700">
        
        <h1 className="mt-6 text-3xl font-bold tracking-wide">
          Welcome, <span className="text-blue-400">{user.name}</span> 👋
        </h1>
        <p className="mt-2 text-gray-300 text-lg">{user.email}</p>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
