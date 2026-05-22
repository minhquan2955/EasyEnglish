import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g. IELTS-ADV
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["ielts", "nursery", "kids", "teens"],
    },
    totalSessions: { type: Number, required: true },
    sessionDurationMins: { type: Number, required: true },
    tuitionFee: { type: Number, required: true }, // VND
    curriculum: [
      {
        sessionNo: Number,
        topic: String,
        materials: String,
      },
    ],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
