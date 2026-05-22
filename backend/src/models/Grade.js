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

export default mongoose.model("Grade", gradeSchema);
