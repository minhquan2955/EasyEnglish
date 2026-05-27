import { z } from "zod";

/**
 * Schema validate khi ĐIỂM DANH HÀNG LOẠT (bulk check-in)
 */
export const bulkCheckInSchema = z.object({
  scheduleId: z
    .string({ required_error: "Buổi học là bắt buộc" })
    .length(24, "scheduleId không hợp lệ"),

  students: z
    .array(
      z.object({
        studentId: z
          .string({ required_error: "Học sinh là bắt buộc" })
          .length(24, "studentId không hợp lệ"),
        status: z.enum(["present", "absent"], {
          errorMap: () => ({
            message: "Trạng thái phải là: present hoặc absent",
          }),
        }),
        notes: z.string().optional(),
      }),
    )
    .min(1, "Phải có ít nhất 1 học sinh để điểm danh"),
});

/**
 * Schema validate khi CẬP NHẬT 1 bản ghi điểm danh
 */
export const updateAttendanceSchema = z.object({
  status: z
    .enum(["present", "absent"], {
      errorMap: () => ({
        message: "Trạng thái phải là: present hoặc absent",
      }),
    })
    .optional(),
  notes: z.string().optional(),
});
