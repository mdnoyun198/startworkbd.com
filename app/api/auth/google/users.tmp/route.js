import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { connectToDB } from "@/utils/db";
import PendingSignup from "@/models/users.tmp";
import Users from "@/models/users";
import Session from "@/models/sessions";
import { createToken } from "@/utils/jwt";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  await connectToDB();

  try {
    // 1️⃣ Google OAuth setup
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/users.tmp`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    // 2️⃣ Check if user already exists
    const existingUser = await Users.findOne({ Email: data.email });

    if (existingUser) {
      // ✅ Existing user → session create + login
      const session = await Session.create({
        userId: existingUser._id,
        userAgent: req.headers.get("user-agent") || "Unknown",
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        deviceName: "Google OAuth",
        createdAt: new Date(),
      });

      const accessToken = signAccessToken(existingUser._id, session._id);
      const refreshToken = signRefreshToken(existingUser._id, session._id);
      session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await session.save();

      const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/home`);
      res.cookies.set("accessToken", accessToken, { httpOnly: true, path: "/", maxAge: 15 * 60, sameSite: "lax" });
      res.cookies.set("refreshToken", refreshToken, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60, sameSite: "lax" });
      return res;
    }

    // 3️⃣ New user → PendingSignup create
    await PendingSignup.deleteMany({ Email: data.email });

    const tempKey = createToken({ tempEmail: data.email }, { expiresIn: "15m" });
    await PendingSignup.create({
      FirstName: data.given_name || "User",
      LastName: data.family_name || "User",
      Email: data.email,
      Picture: data.picture || "",
      key: tempKey
    });

    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/signup`);
    res.cookies.set("allow_pending", "1", { maxAge: 300, path: "/" }); // 5 min
    return res;

  } catch (err) {
    console.error("Google verify error:", err);
    return NextResponse.json({ error: "Google OAuth failed" }, { status: 500 });
  }
}
