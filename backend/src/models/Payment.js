import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["cash", "transfer"],
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String },
    receiptNumber: { type: String },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

paymentSchema.index({ studentId: 1, classId: 1 });
paymentSchema.index({ paymentDate: -1 });

export default mongoose.model("Payment", paymentSchema);
