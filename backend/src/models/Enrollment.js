import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    enrollDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "completed", "dropped", "transferred"],
      default: "active",
    },
    finalGrade: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Enrollment", enrollmentSchema);
