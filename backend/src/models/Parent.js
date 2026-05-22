import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  relationship: { type: String, enum: ['father', 'mother', 'guardian'] }
}, { timestamps: true });

export default mongoose.model('Parent', parentSchema);
