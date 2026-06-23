import Counter from "../models/Counter.js";

/**
 * Gets the next sequence value for a given sequence name.
 * Uses atomic findOneAndUpdate to ensure no race conditions.
 * @param {string} sequenceName - The name of the sequence (e.g., 'studentId', 'teacherId')
 * @returns {Promise<number>} - The next integer sequence value
 */
export const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } // upsert creates the doc if it doesn't exist
  );
  return sequenceDocument.sequence_value;
};
