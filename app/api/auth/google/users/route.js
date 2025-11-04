import { connectToDB } from "@/utils/db";
import PendingSignup from "@/models/users.tmp";
import Users from "@/models/users";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionForUser } from "@/lib/auth";

export async function GET() {
  await connectToDB();

  // cookies() await করতে হবে
  const cookieStore = await cookies();  // <-- এখানে await লাগছে
  const allow = cookieStore.get("allow_pending")?.value;

  if (!allow) return NextResponse.json({ error: "Unauthorized or expired" }, { status: 403 });

  const pending = await PendingSignup.findOne().sort({ createdAt: -1 }).lean();
  if (!pending) return NextResponse.json({ error: "No pending signup" }, { status: 404 });

  const res = NextResponse.json({
    _id: pending._id,
    key: pending.key,
    FirstName: pending.FirstName,
    LastName: pending.LastName,
    Email: pending.Email,
    Picture: pending.Picture
  });

  res.cookies.delete("allow_pending");
  return res;
}

export async function POST(req) {
  await connectToDB();
  try {
    const body = await req.json();
    const { tempId, key, username, dateOfBirth, deviceName } = body;

    // pending খুঁজে বের করা
    const pending = await PendingSignup.findOne({ _id: tempId, key });
    
    let user;

    if (pending) {
      // নতুন ইউজার তৈরি
      user = await Users.create({
        FirstName: pending.FirstName,
        LastName: pending.LastName,
        UserName: username.toLowerCase(),
        DateOfBirth: new Date(dateOfBirth),
        Email: pending.Email,
        Picture: pending.Picture || ""
      });

      await PendingSignup.deleteOne({ _id: tempId });
    } else {
      // যদি pending না থাকে, check users collection (যদি আগেই আছে)
      user = await Users.findOne({ Email: body.email });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // সেশন তৈরি + লগইন
    const { accessToken, refreshToken } = await createSessionForUser(user, req, deviceName);

    const response = NextResponse.json({ message: "Login successful", user });

    response.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 15*60, path: "/", sameSite: "lax" });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 7*24*60*60, path: "/", sameSite: "lax" });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
