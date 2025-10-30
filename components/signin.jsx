'use client';
import React from "react";

const Signin = ({ onGoogleData }) => {

  const handleGoogleSignIn = async () => {
    try {
      const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirect_uri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`;
      const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
      const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&prompt=select_account`;

      // Google OAuth redirect
      window.location.href = url;
    } catch (err) {
      console.error("Google Sign-in error:", err);
    }
  };

  return (
    <div className="w-full mt-3">
      <button
        type="button"
        className="signup-google w-full px-4 py-2 flex gap-2 items-center justify-center rounded-lg duration-150 bg-red-500 text-white hover:bg-red-600"
        onClick={handleGoogleSignIn}
      >
        <img
          className="w-6 h-6"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="google logo"
          loading="lazy"
        />
        <span>Sign in with Google</span>
      </button>
    </div>
  );
};

export default Signin;
