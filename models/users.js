import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  FirstName: { type: String, required: true, minlength: 1, maxlength: 10, trim: true },
  LastName: { type: String, required: true, minlength: 2, maxlength: 10, trim: true },
  UserName: { type: String, required: true, minlength: 4, maxlength: 20, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+$/ },
  Email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  Phone: { type: String, trim: true, unique: true, sparse: true },
  Password: { type: String,}, // plain text password
  Picture: { type: String },
  Bio: { type: String, maxlength: 50 },
  DateOfBirth: { type: Date, required: true },
  Address: { type: String, maxlength: 50 },
});

// Email বা Phone যেকোনো একটি দিতে হবে
UserSchema.pre("validate", function(next) {
  if (!this.Email && !this.Phone) {
    this.invalidate("Email", "Email বা Phone দিতে হবে");
    this.invalidate("Phone", "Email বা Phone দিতে হবে");
  }
  next();
});


// Password compare (optional, শুধু plain text check করতে চাইলে)
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return this.Password === candidatePassword;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);




