'use server';
import { google } from 'googleapis';
import { connectToDB } from '@/utils/db';
import User from '@/models/users';
import UsersTmp from '@/models/users.tmp';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/signup`
);

export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return new Response("No code provided", { status: 400 });

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    // চেক যদি user আগে থেকে থাকে
    const existingUser = await User.findOne({ Email: data.email });
    if (existingUser) {
      return new Response(JSON.stringify({ userExists: true, Email: data.email }), { status: 200 });
    }

    // নতুন user → tmp collection এ ১৫ মিনিট TTL সহ
    const tempKey = Math.random().toString(36).slice(2, 17); // 15 অক্ষরের key
    const tmpUser = await UsersTmp.create({
      FirstName: data.given_name,
      LastName: data.family_name,
      Email: data.email,
      OTPExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min TTL
      UserName: tempKey, // key as temporary username
      DateOfBirth: new Date(), // dummy, after signup replace
    });

    // Redirect user to signup page with tmp id & key
    return new Response(JSON.stringify({
      tempId: tmpUser._id,
      key: tempKey
    }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
