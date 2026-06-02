import Class from "../models/Class.js";

/**
 * Checks for schedule conflicts based on teacher or room.
 * Two classes conflict if they overlap in ALL of the following:
 * - Date range (startDate to endDate)
 * - Days of the week
 * - Time of day (startTime to endTime)
 * 
 * @param {Object} params
 * @returns {Promise<{hasConflict: boolean, message?: string}>}
 */
export const checkScheduleConflict = async ({
  teacherId,
  room,
  schedule,
  startDate,
  endDate,
  excludeClassId = null,
}) => {
  // If schedule or dates are incomplete, we cannot fully check conflicts
  if (!schedule || !schedule.daysOfWeek || schedule.daysOfWeek.length === 0) {
    return { hasConflict: false };
  }
  if (!startDate || !endDate) {
    return { hasConflict: false };
  }

  // Define overlap condition:
  // 1. Existing class startDate is before or equal to new class endDate
  // 2. Existing class endDate is after or equal to new class startDate
  const baseQuery = {
    status: "active",
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
    "schedule.daysOfWeek": { $in: schedule.daysOfWeek },
    "schedule.startTime": { $lt: schedule.endTime },
    "schedule.endTime": { $gt: schedule.startTime },
  };

  if (excludeClassId) {
    baseQuery._id = { $ne: excludeClassId };
  }

  // Check Teacher conflict
  if (teacherId) {
    const teacherConflict = await Class.findOne({
      ...baseQuery,
      teacherId,
    });
    if (teacherConflict) {
      return {
        hasConflict: true,
        message: `Giáo viên đã có lớp ${teacherConflict.classCode} trùng lịch dạy`,
      };
    }
  }

  // Check Room conflict
  if (room) {
    const roomConflict = await Class.findOne({
      ...baseQuery,
      room,
    });
    if (roomConflict) {
      return {
        hasConflict: true,
        message: `Phòng ${room} đã được sử dụng bởi lớp ${roomConflict.classCode} trong khung giờ này`,
      };
    }
  }

  return { hasConflict: false };
};
