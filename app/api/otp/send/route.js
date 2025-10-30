import { sendEmailOTP } from "../utils/email";
import { sendPhoneOTP } from "../utils/phone";
import { connectToDB } from "@/utils/db";
import TempUser from "@/models/users.tmp"; // MongoDB temp collection

export async function POST(req) {
  const { Email, Phone, FirstName, ListName, UserName, Password, DateOfBirth } = await req.json();
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  await connectToDB();

  const existingTmp = await TempUser.findOne({ $or: [{ Email }, { Phone }] });

  if (existingTmp && (new Date() - existingTmp.createdAt) / 1000 < 900) { // 15 min
    return new Response(JSON.stringify({ error: "OTP already sent. Wait 15 min" }), { status: 400 });
  }

  let tmpData = { FirstName, ListName, Email, Phone, Password, UserName, DateOfBirth,   otp, createdAt: new Date() };

  await TempUser.findOneAndUpdate(
    { $or: [{ Email }, { Phone }] },
    tmpData,
    { upsert: true }
  );

  if (Email) await sendEmailOTP(Email, otp);
  if (Phone) await sendPhoneOTP(Phone, otp);

  return new Response(JSON.stringify({ success: true, otpSent: true }), { status: 200 });
}
