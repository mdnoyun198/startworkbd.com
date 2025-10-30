'use server';
import { connectToDB } from '@/lib/mongodb';
import UsersTmp from '@/models/users.tmp';
import User from '@/models/users';
import { hashPassword } from '@/lib/auth';

export async function POST(req) {
  await connectToDB();
  const data = await req.json();

  // Check if email already exists
  const existingUser = await User.findOne({ Email: data.Email });
  if (existingUser) return new Response(JSON.stringify({ error: "Email already exists" }), { status: 400 });

  // Save final user
  const newUser = await User.create({
    FirstName: data.FirstName,
    LastName: data.LastName,
    UserName: data.UserName,
    Email: data.Email,
    Phone: data.Phone,
    Password: await hashPassword(data.Password || "123456"),
    DateOfBirth: data.DateOfBirth,
  });

  // Remove tmp user
  await UsersTmp.findByIdAndDelete(data._id);

  return new Response(JSON.stringify({ message: "Signup successful", userId: newUser._id }), { status: 201 });
}
