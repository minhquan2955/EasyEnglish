import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    sessionNumber: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true }, // HH:MM
    endTime: { type: String, required: true }, // HH:MM
    room: { type: String },
    topic: { type: String },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "makeup"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Schedule", scheduleSchema);
