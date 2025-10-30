import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Session from "@/models/sessions";

// 🔑 Access Token তৈরি
export const signAccessToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

// 🔑 Refresh Token তৈরি
export const signRefreshToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// 🔍 Access Token যাচাই
export const verifyAccessToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // সেশন সার্ভারে আছে কি না দেখা
    const activeSession = await Session.findOne({
      _id: decoded.sessionId,
      userId: decoded.userId
    });

    if (!activeSession) throw new Error("Session removed");

    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

// 🔁 Refresh Token যাচাই
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }
};

// 🧂 পাসওয়ার্ড হ্যাশ
export const hashPassword = async (password) => await bcrypt.hash(password, 10);

// 🔍 পাসওয়ার্ড তুলনা
export const comparePassword = async (password, hashed) => await bcrypt.compare(password, hashed);
