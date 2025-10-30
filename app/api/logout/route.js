import { connectToDB } from "@/utils/db";
import Session from "@/models/sessions";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectToDB(); // DB connect

    const cookieHeader = req.headers.get("cookie") || "";
    const accessTokenCookie = cookieHeader
      .split(";")
      .find(c => c.trim().startsWith("accessToken="));

    if (accessTokenCookie) {
      const token = accessTokenCookie.split("=")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const userId = decoded.userId;

        // MongoDB থেকে session delete
        await Session.deleteMany({ userId });
      } catch (err) {
        console.warn("⚠️ Invalid token, skipping session delete");
      }
    }

    // HttpOnly কুকি রিমুভ
    const response = new Response(JSON.stringify({ message: "Logged out" }), { status: 200 });
    response.headers.append(
      "Set-Cookie",
      `accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );
    response.headers.append(
      "Set-Cookie",
      `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );

    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: "Logout failed" }), { status: 500 });
  }
}
