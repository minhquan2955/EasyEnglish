import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeCode: { type: String, required: true, unique: true },
  specializations: [{ type: String }],
  certifications: [{
    name: String,
    issuedBy: String,
    year: Number
  }],
  weeklySessionLimit: { type: Number },
  salary: {
    type: { type: String, enum: ['hourly', 'fixed'] },
    amount: Number
  },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Teacher', teacherSchema);
