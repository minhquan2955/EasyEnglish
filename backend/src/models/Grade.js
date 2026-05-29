import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
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
    assessmentType: {
      type: String,
      enum: ["midterm", "final", "quiz", "homework", "speaking", "writing"],
      required: true,
    },
    title: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    gradedAt: { type: Date, default: Date.now },
    feedback: { type: String },
  },
  { timestamps: true },
);
// Compound Index: 1 HS chỉ có 1 điểm cho mỗi bài trong 1 lớp
gradeSchema.index(
  { studentId: 1, classId: 1, assessmentType: 1, title: 1 },
  { unique: true },
);
export default mongoose.model("Grade", gradeSchema);
