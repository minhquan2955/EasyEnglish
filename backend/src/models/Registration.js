import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    childName: { type: String, required: true },
    childAge: { type: Number },
    notes: { type: String }, // "Muốn học IELTS, lịch T2-T4-T6"
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Registration", registrationSchema);
