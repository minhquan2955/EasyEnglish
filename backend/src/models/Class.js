import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    classCode: { type: String, required: true, unique: true, index: true },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    room: { type: String },
    maxStudents: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    schedule: {
      daysOfWeek: [{ type: Number }], // 0-6 (Sunday-Saturday)
      startTime: String, // HH:MM
      endTime: String, // HH:MM
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Class", classSchema);
