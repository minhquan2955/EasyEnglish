import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent"],
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
