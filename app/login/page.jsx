"use client"
import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Signin from "@/components/signin";

const Login = () => {
  const router = useRouter()
  const [loginInput, setLoginInput] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginInput,
          password,
          deviceName: "Web Browser"
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      // accessToken session memory / state
      sessionStorage.setItem("accessToken", data.accessToken)

      // redirect home
      router.push("/home")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row">

      {/* Img + Text Section */}
      <div className="flex flex-col items-center justify-center p-6 h-[30%] lg:h-full lg:w-1/2">
        <Image src="/text.sw.svg" alt="Start Work BD" width={300} height={300} className="hidden lg:block mb-4" />
        <Image src="/text.sw.svg" alt="Start Work BD" width={200} height={200} className="hidden md:block lg:hidden mb-4" />
        <Image src="/logo.sw.svg" alt="logo" width={100} height={100} className="block md:hidden mb-3" />
        <h1 className="text-xl md:text-2xl font-bold text-center">Welcome To Start Work BD</h1>
        <p className="hidden lg:block text-gray-700 mt-2 text-center">Sign up today and start your professional journey</p>
      </div>

      {/* Login Section */}
      <div className="flex items-start lg:items-center justify-center h-[70%] lg:h-full lg:w-1/2">
        <div className="w-[95%] xs:w-[90%] sm:w-[85%] md:w-[70%] lg:w-96 p-6 rounded-none lg:rounded-xl bg-white lg:shadow-md lg:border lg:border-gray-300 overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username / Email / Phone"
              className="signup-input"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-center items-center">
              <button
                type="submit"
                className="submit bg-blue-500 text-white p-2 px-5 rounded-lg duration-150 w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

            <button className="text-sm text-blue-600 hover:underline">Forgot your password?</button>

            {/* নতুন একাউন্ট বাটন /signup রিডাইরেক্ট */}
            <Link href="/signup" className="mt-6 bg-blue-500 text-white p-2 px-5 rounded-lg duration-150 text-center block">
              Create a new account
            </Link>

            {/* Google Signin */}
            <div className="mt-4 flex justify-center">
              <Signin />
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
