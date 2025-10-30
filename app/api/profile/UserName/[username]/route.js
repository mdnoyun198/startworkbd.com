import { connectToDB } from "@/utils/db";
import User from "@/models/users";
import Profile from "@/models/profile";

export async function GET(req, { params }) {
  const { username } = params;

  try {
    await connectToDB();

    const user = await User.findOne({ UserName: username });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const profile = await Profile.findOne({ userId: user._id });

    return new Response(JSON.stringify({ user, profile }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
