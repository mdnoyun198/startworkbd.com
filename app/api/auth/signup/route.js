import { connectToDB } from "@/utils/db";
import User from "@/models/users";
import UserTmp from "@/models/users.tmp";
import { sendEmailOTP } from "@/utils/otp/email";
import { sendPhoneOTP } from "@/utils/otp/phone";
import bcrypt from "bcrypt";


export async function POST(req) {
  try {
    const { FirstName, LastName, UserName, Email, Phone, Password, DateOfBirth } = await req.json();


    if (!FirstName || !LastName || !UserName || !Password || !DateOfBirth)
      return new Response(JSON.stringify({ error: "Required fields missing" }), { status: 400 });

    if (!Email && !Phone)
      return new Response(JSON.stringify({ error: "Email or Phone required" }), { status: 400 });

    await connectToDB();

    // duplicate check
    const dupQuery = [{ UserName }];
    if (Email) dupQuery.push({ Email });
    if (Phone) dupQuery.push({ Phone });
    const dupUser = await User.findOne({ $or: dupQuery });
    if (dupUser) {
      if (dupUser.UserName === UserName) return new Response(JSON.stringify({ error: "Duplicate UserName" }), { status: 400 });
      if (Email && dupUser.Email === Email) return new Response(JSON.stringify({ error: "Duplicate Email" }), { status: 400 });
      if (Phone && dupUser.Phone === Phone) return new Response(JSON.stringify({ error: "Duplicate Phone" }), { status: 400 });
    }

    // temp user
    const tmpQuery = [{ UserName }];
    if (Email) tmpQuery.push({ Email });
    if (Phone) tmpQuery.push({ Phone });

    let tmpUser = await UserTmp.findOne({ $or: tmpQuery });

    const now = new Date();
    if (tmpUser && tmpUser.OTPExpiresAt && tmpUser.OTPExpiresAt > now) {
      return new Response(JSON.stringify({ error: "OTP already sent. Wait 15 minutes." }), { status: 400 });
    }

    // generate OTP & hash
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpPlain, 12); // production-ready

    const passwordHash = await bcrypt.hash(Password, 12);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15min

    const tmpDoc = {
      FirstName: FirstName,
      LastName: LastName,
      UserName,
      Password: passwordHash,
      OTP: otpHash,
      OTPExpiresAt: expires,
      DateOfBirth, // <-- added here
    };
    if (Email) tmpDoc.Email = Email;
    if (Phone) tmpDoc.Phone = Phone;

    if (!tmpUser) tmpUser = await UserTmp.create(tmpDoc);
    else {
      Object.assign(tmpUser, tmpDoc);
      await tmpUser.save();
    }

    // send OTP
    try {
      if (Email) await sendEmailOTP(Email, otpPlain);
      else if (Phone) await sendPhoneOTP(Phone, otpPlain);
    } catch (err) {
      console.error("OTP send error:", err);
      return new Response(JSON.stringify({ error: "Failed to send OTP" }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "OTP sent successfully", userId: tmpUser._id }), { status: 201 });

  } catch (err) {
    console.error("Signup error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: 500 });
  }
}

