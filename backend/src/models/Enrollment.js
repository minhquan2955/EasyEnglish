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
    notes: { type: String },
  },
  { timestamps: true },
);

// Compound Unique Index: Đảm bảo 1 học sinh chỉ ghi danh VÀO 1 lớp DUY NHẤT 1 lần
enrollmentSchema.index({ studentId: 1, classId: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
