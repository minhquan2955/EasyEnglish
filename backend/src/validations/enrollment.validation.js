import { z } from "zod";

/**
 * Schema validate khi GHI DANH học sinh vào lớp (POST)
 *
 * Chỉ cần 2 trường bắt buộc: studentId và classId
 */
export const createEnrollmentSchema = z.object({
  // studentId phải là chuỗi 24 ký tự (MongoDB ObjectId)
  studentId: z
    .string({ required_error: "Học sinh là bắt buộc" })
    .length(24, "studentId không hợp lệ"),

  // classId phải là chuỗi 24 ký tự
  classId: z
    .string({ required_error: "Lớp học là bắt buộc" })
    .length(24, "classId không hợp lệ"),

  // enrollDate: mặc định Date.now trong Model, nhưng có thể truyền tùy chỉnh
  enrollDate: z.coerce.date().optional(),
});

/**
 * Schema validate khi CẬP NHẬT enrollment (PUT)
 * KHÔNG cho phép đổi studentId và classId (vì sẽ phá vỡ tính toàn vẹn dữ liệu).
 */
export const updateEnrollmentSchema = z.object({
  status: z
    .enum(["active", "completed", "dropped", "transferred"], {
      errorMap: () => ({
        message:
          "Trạng thái phải là: active, completed, dropped, hoặc transferred",
      }),
    })
    .optional(),
  finalGrade: z.string().optional(),
});
