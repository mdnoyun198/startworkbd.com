"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const router = useRouter();

  // ✅ STEP 1: Get token from sessionStorage or cookies
 useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile/UserID", {
        credentials: "include", // HttpOnly cookie পাঠাবে
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login required");
      } else {
        setUser(data);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);




  if (loading) return <div className="text-center mt-10">⏳ Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!user) return <div className="text-center mt-10">No user data</div>;

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");

      // লোকাল স্টোরেজ থেকে টোকেন মুছে দাও
      sessionStorage.removeItem("accessToken");

      // API কল লগআউট করার জন্য
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("❌ Logout failed");
        return;
      }

      // কুকি মুছে দাও
      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";

      // লগইন পেজে পাঠাও
      router.push("/login");
    } catch (err) {

    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col justify-start items-center w-full lg:w-[86%] py-6 px-4 lg:px-10">
        <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden shadow-lg">
          <Image
            src={user.Picture || "/default-avatar.png"}
            alt={`${user.FirstName} ${user.LastName} profile`}
            width={128}
            height={128}
            className="object-cover object-center h-32 w-32"
          />
        </div>

        <h2 className="font-semibold text-lg lg:text-xl mt-4">{user.FirstName} {user.LastName}</h2>
        <p className="text-gray-500">@{user.UserName}</p>

        <div className="flex gap-4 mt-4">
          <button className="bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transition">
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-6 rounded-full hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col my-5 px-2 lg:px-0 space-y-3 max-w-md w-full">
          {user.Bio && <div className="text-gray-700 text-sm">{user.Bio}</div>}
          {user.Phone && (
            <div className="grid grid-cols-[100px_10px_1fr] gap-x-2">
              <p className="font-semibold text-gray-900">Phone</p>
              <p className="text-gray-900">:</p>
              <p className="text-gray-700">{user.Phone}</p>
            </div>
          )}
          {user.Email && (
            <div className="grid grid-cols-[100px_10px_1fr] gap-x-2">
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-gray-900">:</p>
              <p className="text-gray-700">{user.Email}</p>
            </div>
          )}
          {user.Address && (
            <div className="grid grid-cols-[100px_10px_1fr] gap-x-2">
              <p className="font-semibold text-gray-900">Address</p>
              <p className="text-gray-900">:</p>
              <p className="text-gray-700">{user.Address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

