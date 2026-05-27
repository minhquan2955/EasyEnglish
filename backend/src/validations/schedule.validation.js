import { z } from "zod";

/**
 * Schema validate khi TẠO/CẬP NHẬT một buổi học riêng lẻ
 *
 * Trường hợp sử dụng:
 *   - Admin tạo buổi học bù (makeup)
 *   - Admin sửa thông tin 1 buổi học (đổi phòng, đổi giờ, đổi GV dạy thay...)
 */
export const createScheduleSchema = z.object({
  classId: z
    .string({ required_error: "Lớp học là bắt buộc" })
    .length(24, "classId không hợp lệ"),

  teacherId: z
    .string({ required_error: "Giáo viên là bắt buộc" })
    .length(24, "teacherId không hợp lệ"),

  sessionNumber: z
    .number({ required_error: "Số thứ tự buổi học là bắt buộc" })
    .positive("Số buổi phải là số dương"),

  date: z.coerce.date({ required_error: "Ngày học là bắt buộc" }),

  startTime: z
    .string({ required_error: "Giờ bắt đầu là bắt buộc" })
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Giờ bắt đầu phải có định dạng HH:MM",
    }),

  endTime: z
    .string({ required_error: "Giờ kết thúc là bắt buộc" })
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Giờ kết thúc phải có định dạng HH:MM",
    }),

  room: z.string().optional(),
  topic: z.string().optional(),
  notes: z.string().optional(),

  status: z.enum(["scheduled", "completed", "cancelled", "makeup"]).optional(),
});

/**
 * Schema cho UPDATE — chỉ cho phép sửa một số trường
 *
 * KHÔNG cho phép đổi classId (vì buổi học thuộc về 1 lớp cố định)
 * CÓ cho phép đổi teacherId (giáo viên dạy thay)
 */
export const updateScheduleSchema = z.object({
  teacherId: z.string().length(24, "teacherId không hợp lệ").optional(),

  date: z.coerce.date().optional(),

  startTime: z
    .string()
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Giờ bắt đầu phải có định dạng HH:MM",
    })
    .optional(),

  endTime: z
    .string()
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Giờ kết thúc phải có định dạng HH:MM",
    })
    .optional(),

  room: z.string().optional(),
  topic: z.string().optional(),

  status: z
    .enum(["scheduled", "completed", "cancelled", "makeup"], {
      errorMap: () => ({
        message:
          "Trạng thái phải là: scheduled, completed, cancelled, hoặc makeup",
      }),
    })
    .optional(),
});

/**
 * Schema validate khi SINH TỰ ĐỘNG lịch học
 * Chỉ cần classId — mọi thông tin khác lấy từ Class + Course
 */
export const generateScheduleSchema = z.object({
  classId: z
    .string({ required_error: "Lớp học là bắt buộc" })
    .length(24, "classId không hợp lệ"),
});
