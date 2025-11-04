"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Signin from "@/components/signin";

export default function SignUp() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [inputType, setInputType] = useState("text");
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});
  const [userId, setUserId] = useState("");
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, watch, reset, setError, formState: { errors } } = useForm();
  const contactValue = watch("contact", "");

  // Detect input type
  useEffect(() => {
    const onlyNumbers = /^\d+$/.test(contactValue);
    setInputType(onlyNumbers ? "number" : "email");
  }, [contactValue]);

  // Check pending signup
  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await fetch("/api/auth/google/users", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data._id && data.key) {
          setPending(data);
          setStep(2); // Skip step 1
          setUserData({
            FirstName: data.FirstName,
            LastName: data.LastName,
            Email: data.Email,
            Phone: data.Phone,
            key: data.key,
            tempId: data._id
          });
        } else {
          setPending(null);
        }
      } catch {
        setPending(null);
      } finally {
        setLoading(false);
      }
    };
    checkPending();
  }, []);

  const onSubmit = async (data) => {
    setMessage("");

    if (step === 1) {
      // New user Step 1
      setUserData({
        FirstName: data.FirstName,
        LastName: data.LastName,
        Email: inputType === "email" ? data.contact : "",
        Phone: inputType === "number" ? data.contact : "",
        Password: data.Password,
      });
      reset();
      setStep(2);
    } else if (step === 2) {
      // Step 2: Username + DOB
      const payload = pending
        ? {
            tempId: pending._id,
            key: pending.key,
            username: data.UserName,
            dateOfBirth: data.DateOfBirth,
            deviceName: "web",
          }
        : {
            FirstName: userData.FirstName,
            LastName: userData.LastName,
            UserName: data.UserName,
            DateOfBirth: data.DateOfBirth,
            Email: userData.Email || "",
            Phone: userData.Phone || "",
            Password: userData.Password || "",
            deviceName: "web",
          };

      try {
        const res = await fetch(
          pending ? "/api/auth/google/users" : "/api/auth/signup",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const resData = await res.json();

        if (res.ok) {
          setMessage("Signup complete! Redirecting...");
          reset();
          setTimeout(() => router.push("/home"), 800);
        } else {
          // Handle errors
          if (resData.error === "Duplicate UserName") setError("UserName", { type: "manual", message: "Username already in use" });
          else if (resData.error === "Duplicate Email" || resData.error === "Duplicate Phone") setError("contact", { type: "manual", message: `${resData.error.replace("Duplicate ", "")} already in use` });
          else setMessage(resData.error || `Error ${res.status}`);
        }
      } catch (err) {
        console.log(err);
        setMessage("Server error");
      }
    } else if (step === 3) {
      // OTP verification
      const otpValue = data.otp;
      try {
        const res = await fetch("/api/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, otp: otpValue }),
        });

        const resData = await res.json();

        if (res.ok) {
          router.push("/login");
        } else {
          setMessage(resData.error || "Invalid OTP");
        }
      } catch (err) {
        console.log(err);
        setMessage("Server error");
      }
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-50">
      {/* Left */}
      <div className="flex flex-col items-center justify-center p-6 h-[30%] lg:h-full lg:w-1/2">
        <Image src="/text.sw.svg" alt="Start Work BD" width={300} height={300} className="hidden lg:block mb-4" />
        <Image src="/text.sw.svg" alt="Start Work BD" width={200} height={200} className="hidden md:block lg:hidden mb-4" />
        <Image src="/logo.sw.svg" alt="logo" width={100} height={100} className="block md:hidden mb-3" />
        <h1 className="text-xl md:text-2xl font-bold text-center">Create Your Account</h1>
        <p className="hidden lg:block text-gray-700 mt-2 text-center">
          Join Start Work BD and start your professional journey
        </p>
      </div>

      {/* Right */}
      <div className="flex items-start lg:items-center justify-center h-[70%] lg:h-full lg:w-1/2">
        <div className="w-[95%] xs:w-[90%] sm:w-[85%] md:w-[70%] lg:w-96 p-6 rounded-none lg:rounded-xl bg-white lg:shadow-md lg:border lg:border-gray-300 overflow-hidden">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: New user */}
            {!pending && step === 1 && (
              <>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="w-full sm:w-[50%]">
                    <input className="signup-input" type="text" placeholder="First Name" {...register("FirstName", { required: true })} />
                    {errors.FirstName && <p className="text-red-500 text-sm">{errors.FirstName.message}</p>}
                  </div>
                  <div className="w-full sm:w-[50%]">
                    <input className="signup-input" type="text" placeholder="Last Name" {...register("LastName", { required: true })} />
                    {errors.LastName && <p className="text-red-500 text-sm">{errors.LastName.message}</p>}
                  </div>
                </div>

                <input className="signup-input" type={inputType} placeholder="Email or PhoneNumber" {...register("contact", { required: true })} />
                {errors.contact && <p className="text-red-500 text-sm">{errors.contact.message}</p>}

                <input className="signup-input" type="password" placeholder="Password" {...register("Password", { required: true })} />
                {errors.Password && <p className="text-red-500 text-sm">{errors.Password.message}</p>}

                <button type="submit" className="submit my-2 bg-blue-500 text-white p-2 px-5 rounded-lg duration-150">Next</button>

                {/* Google Signin */}
                <div className="mt-4 flex justify-center">
                  <Signin />
                </div>
              </>
            )}

            {/* Step 2: Username + DOB */}
            {step === 2 && (
              <>
                <input className="signup-input" type="text" placeholder="Username" {...register("UserName", { required: true })} />
                {errors.UserName && <p className="text-red-500 text-sm">{errors.UserName.message}</p>}

                <input className="signup-input" type="date" placeholder="Date of Birth" {...register("DateOfBirth", { required: true })} />
                {errors.DateOfBirth && <p className="text-red-500 text-sm">{errors.DateOfBirth.message}</p>}

                <button type="submit" className="submit my-3 bg-green-500 text-white p-2 px-5 rounded-lg duration-150">Next</button>
              </>
            )}

            {/* Step 3: OTP */}
            {step === 3 && (
              <>
                <input className="signup-input" type="text" placeholder="Enter OTP" maxLength={8} {...register("otp", { required: true })} />
                {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}

                <button type="submit" className="submit my-3 bg-green-500 text-white p-2 px-5 rounded-lg duration-150">Submit OTP</button>
              </>
            )}
          </form>

          {message && <p className="mt-3 text-red-500 text-sm">{message}</p>}

          {step === 1 && !pending && (
            <p className="text-sm text-gray-700 mt-2 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline cursor-pointer">
                Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
