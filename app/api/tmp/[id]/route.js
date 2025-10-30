'use server';
import { connectToDB } from '@/utils/db';
import UsersTmp from '@/models/users.tmp';

export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const tempId = req.url.split("/").pop();

  const tmpUser = await UsersTmp.findById(tempId);
  if (!tmpUser) return new Response(JSON.stringify({ error: "Temp user not found" }), { status: 404 });
  if (tmpUser.UserName !== key) return new Response(JSON.stringify({ error: "Invalid key" }), { status: 400 });

  return new Response(JSON.stringify(tmpUser), { status: 200 });
}
