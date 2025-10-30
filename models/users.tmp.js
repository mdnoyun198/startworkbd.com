// models/users.tmp.js


import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserTmpSchema = new mongoose.Schema({
  FirstName: { type: String, required: true, minlength: 1, maxlength: 10, trim: true },
  LastName: { type: String, required: true, minlength: 2, maxlength: 10, trim: true },
  UserName: { type: String, required: true, minlength: 4, maxlength: 20, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+$/ },
  Email: { type: String, lowercase: true, trim: true, sparse: true },
  Phone: { type: String, trim: true, sparse: true },
  Password: { type: String }, // will be hashed on save
  OTP: { type: String },      // will be hashed on save
  OTPExpiresAt: { type: Date },
  DateOfBirth: { type: Date,}, // <-- নতুন ফিল্ড এড করা হলো
}, { timestamps: true });

// TTL index → auto-delete after OTPExpiresAt
UserTmpSchema.index({ OTPExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Helper to check if string looks like a bcrypt hash
const looksLikeBcryptHash = (s) => typeof s === "string" && /^\$2[aby]\$/.test(s);

// Pre-save: hash Password and OTP if not hashed yet
UserTmpSchema.pre("save", async function (next) {
  try {
    if (this.isModified("Password") && this.Password && !looksLikeBcryptHash(this.Password)) {
      const saltRounds = 12;
      this.Password = await bcrypt.hash(this.Password, saltRounds);
    }

    if (this.isModified("OTP") && this.OTP && !looksLikeBcryptHash(this.OTP)) {
      const otpSaltRounds = 10;
      this.OTP = await bcrypt.hash(this.OTP, otpSaltRounds);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Instance method: compare plain OTP with hashed OTP
UserTmpSchema.methods.compareOTP = async function (plainOtp) {
  if (!this.OTP) return false;
  try {
    return await bcrypt.compare(String(plainOtp), this.OTP);
  } catch (err) {
    return false;
  }
};

export default mongoose.models["users.tmp"] || mongoose.model("users.tmp", UserTmpSchema, "users.tmp");
