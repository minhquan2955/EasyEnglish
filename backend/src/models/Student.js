import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentCode: { type: String, required: true, unique: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
    parentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    enrollmentDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Student", studentSchema);
