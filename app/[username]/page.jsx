import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { connectToDB } from "@/utils/db";
import User from "@/models/users";

export async function generateStaticParams() {
  await connectToDB();
  const users = await User.find({}, "UserName");
  return users.map(user => ({ username: user.UserName }));
}

const ProfilePage = async ({ params }) => {
  const { username } = await params;
  await connectToDB();
  const user = await User.findOne({ UserName: username }).lean();

  if (!user) return <p>User not found</p>;
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Navbar />
      <div className="flex flex-col justify-start items-center w-full lg:w-[86%] py-6 px-4 lg:px-10">

        {/* Profile Picture */}
        <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden">
          <Image
            className="object-cover object-center h-32 w-32"
            src={user.Picture || "/default-avatar.png"}
            alt={`${user.FirstName} ${user.LastName} profile picture`}
            width={128}
            height={128}
          />
        </div>

        {/* Name */}
        <div className="text-center mt-2">
          <h2 className="font-semibold text-lg lg:text-xl">{user.FirstName} {user.LastName}</h2>
          <p className="text-gray-500 text-sm my-2">@{user.UserName}</p>
        </div>

        {/* Stats */}
        <ul className="py-2 mt-2 text-gray-700 flex w-full max-w-md justify-around">
          <li className="flex flex-col items-center">
            <p className="text-black text-lg">Following</p>
            <div>2k</div>
          </li>
          <li className="flex flex-col items-center">
            <p className="text-black text-lg">Followers</p>
            <div>10k</div>
          </li>
          <li className="flex flex-col items-center">
            <p className="text-black text-lg">Friends</p>
            <div>15</div>
          </li>
        </ul>

        {/* Buttons */}
          <div className="flex gap-4 mt-4 w-full max-w-md">
          <button className="flex-1 bg-[#0289FF] text-white py-2 rounded-full hover:bg-blue-600 transition">
            Follow
          </button>
          <button className="flex-1 bg-[#0289FF] text-white py-2 rounded-full hover:bg-blue-600 transition">
            Message
          </button>
        
        </div>

        <div className="flex flex-col my-5 px-2 lg:px-0 space-y-3 max-w-md w-full ml-10">
          {/* Bio */}
          {user.Bio && (
            <div className="flex text-xs text-gray-600 my-2 ">
              <p>{user.Bio}</p>
            </div>
          )}

          {/* Phone */}
          {user.Phone && (
            <div className="grid grid-cols-[100px_10px_1fr] gap-x-2 my-4">
              <p className="font-semibold text-gray-900">Phone</p>
              <p className="text-gray-900">:</p>
              <p className="text-gray-700">{user.Phone}</p>
            </div>
          )}

          {/* Email */}
          {user.Email && (
            <div className="grid grid-cols-[100px_10px_1fr] gap-x-2">
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-gray-900">:</p>
              <p className="text-gray-700">{user.Email}</p>
            </div>
          )}

          {/* Address */}
          {user.Address && (
            <div className="grid grid-cols-[100px_10px_1fr] gap-x-2">
              <p className="font-semibold text-gray-900">Address</p>
              <p className="text-gray-900">:</p>
              <p className="text-gray-700">{user.Address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;





      