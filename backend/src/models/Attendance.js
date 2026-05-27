import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: { type: String, enum: ["present", "absent"], required: true },
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // teacher who checked in
    notes: { type: String },
  },
  { timestamps: true },
);
attendanceSchema.index({ scheduleId: 1, studentId: 1 }, { unique: true });
export default mongoose.model("Attendance", attendanceSchema);
