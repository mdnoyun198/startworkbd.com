// models/session.js
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceName: { type: String, default: "Unknown" },
  userAgent: { type: String },
  ip: { type: String },
  accessToken: { type: String },
  refreshTokenHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);
export default Session;
