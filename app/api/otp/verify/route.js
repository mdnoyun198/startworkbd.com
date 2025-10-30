import { connectToDB } from "@/utils/db";
import UserTmp from "@/models/users.tmp";
import User from "@/models/users";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { userId, otp } = await req.json();
    if (!userId || !otp) return new Response(JSON.stringify({ error: "userId & OTP required" }), { status: 400 });

    await connectToDB();

    const tmpUser = await UserTmp.findById(userId);
    if (!tmpUser) return new Response(JSON.stringify({ error: "OTP expired or invalid" }), { status: 400 });

    const now = new Date();
    if (tmpUser.OTPExpiresAt < now) {
      await UserTmp.findByIdAndDelete(userId).catch(() => { });
      return new Response(JSON.stringify({ error: "OTP expired" }), { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp, tmpUser.OTP);
    if (!isMatch) return new Response(JSON.stringify({ error: "Incorrect OTP" }), { status: 400 });

    // final user
    const userDoc = {
      FirstName: tmpUser.FirstName,
      LastName: tmpUser.LastName,
      UserName: tmpUser.UserName,
      Password: tmpUser.Password,
      DateOfBirth: tmpUser.DateOfBirth, // এইটা যোগ কর
    };

    if (tmpUser.Email) userDoc.Email = tmpUser.Email;
    if (tmpUser.Phone) userDoc.Phone = tmpUser.Phone;

    // prevent duplicates
    const existing = await User.findOne({ $or: [{ UserName: userDoc.UserName }, { Email: userDoc.Email || null }, { Phone: userDoc.Phone || null }] });
    if (existing) {
      await UserTmp.findByIdAndDelete(userId).catch(() => { });
      return new Response(JSON.stringify({ error: "Duplicate account" }), { status: 400 });
    }

    await User.create(userDoc);
    await UserTmp.findByIdAndDelete(userId);

    return new Response(JSON.stringify({ success: true, message: "User verified successfully" }), { status: 200 });

  } catch (err) {
    console.error("OTP verify error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: 500 });
  }
}
