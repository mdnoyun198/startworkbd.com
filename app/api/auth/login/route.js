import { connectToDB } from "@/utils/db";
import User from "@/models/users";
import { comparePassword, createSessionForUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectToDB();
  try {
    const { loginInput, password, deviceName } = await req.json();

    const user = await User.findOne({
      $or: [{ UserName: loginInput }, { Email: loginInput }, { Phone: loginInput }],
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const isValid = await comparePassword(password, user.Password);
    if (!isValid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    const { accessToken, refreshToken } = await createSessionForUser(user, req, deviceName);

    const response = NextResponse.json({ message: "Login successful", user });
    response.headers.append("Set-Cookie", `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${15*60}; SameSite=Lax`);
    response.headers.append("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`);

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
