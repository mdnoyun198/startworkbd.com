import { connectToDB } from "@/utils/db";
import User from "@/models/users";
import Session from "@/models/sessions";
import bcrypt from "bcrypt";
import { comparePassword, signAccessToken, signRefreshToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectToDB();

    const { loginInput, password, deviceName } = await req.json();

    // ইউজার খুঁজে বের করা
    const user = await User.findOne({
      $or: [{ UserName: loginInput }, { Email: loginInput }, { Phone: loginInput }],
    });
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 401 });

    // পাসওয়ার্ড যাচাই
    const isPasswordValid = await comparePassword(password, user.Password);
    if (!isPasswordValid)
      return new Response(JSON.stringify({ error: "Incorrect password" }), { status: 401 });

    // নতুন session তৈরি
    const session = await Session.create({
      userId: user._id,
      userAgent: req.headers.get("user-agent") || "Unknown",
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      deviceName: deviceName || "Unknown",
      createdAt: new Date(),
    });

    // টোকেন তৈরি
    const accessToken = signAccessToken(user._id, session._id);
    const refreshToken = signRefreshToken(user._id, session._id);

    // session এ refreshToken হ্যাশ সংরক্ষণ
    session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await session.save();

    // রেসপন্স কুকি
    const response = new Response(
      JSON.stringify({
        message: "Login successful",
        user: { id: user._id, name: user.UserName, email: user.Email },
      }),
      { status: 200 }
    );

    response.headers.append(
      "Set-Cookie",
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}; SameSite=Lax`
    );
    response.headers.append(
      "Set-Cookie",
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
