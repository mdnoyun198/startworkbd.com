import { connectToDB } from "@/utils/db";
import User from "@/models/users";
import { verifyAccessToken } from "@/lib/auth";


export async function GET(req) {
  try {
    await connectToDB();

    const token = req.cookies.get("accessToken")?.value;
    if (!token)
      return new Response(JSON.stringify({ error: "Login required" }), { status: 401 });

    let decoded;
    try {
      decoded = await verifyAccessToken(token);
    } catch (err) {
      // কুকি মুছে দাও যদি invalid token হয়
      const res = new Response(JSON.stringify({ error: "Session expired" }), { status: 401 });
      res.headers.append("Set-Cookie", `accessToken=; Path=/; Max-Age=0`);
      res.headers.append("Set-Cookie", `refreshToken=; Path=/; Max-Age=0`);
      return res;
    }

    const user = await User.findById(decoded.userId).select("-Password");
    if (!user)
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error("Profile GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
