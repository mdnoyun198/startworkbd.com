"use client";
import React, { useEffect, useState } from "react";
import SignInButton from "@/components/signin";

export default function SigninPage() {
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/auth/google/user", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data._id && data.key) setPending(data);
        else setPending(null);
      } catch {
        setPending(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!pending) return setMessage("No pending signup found");

    try {
      const res = await fetch("/api/auth/google/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempId: pending._id,
          key: pending.key,
          username,
          dateOfBirth: dob
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Signup complete! Redirecting...");
        setTimeout(() => (window.location.href = "/home"), 800);
      } else {
        setMessage(data.error || `Error ${res.status}`);
      }
    } catch {
      setMessage("Network error or invalid response");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!pending) {
    return (
      <div className="p-6 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">Sign up / Sign in</h2>
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Complete your profile</h2>

      <div className="mt-4 flex items-center gap-3">
        {pending.Picture && <img src={pending.Picture} alt="profile" className="w-12 h-12 rounded-full" />}
        <div>
          <div className="font-medium">{pending.FirstName} {pending.LastName}</div>
          <div className="text-sm text-gray-600">{pending.Email}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
          className="border p-2"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Complete Signup
        </button>
      </form>

      {message && <p className="mt-3 text-red-600">{message}</p>}
    </div>
  );
}
