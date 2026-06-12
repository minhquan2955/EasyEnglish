import { z } from "zod";

/**
 * Schema validate khi TẠO lớp học mới (POST)
 *
 *
 *
 * 1. z.string().length(24) : Validate MongoDB ObjectId
 *    - ObjectId luôn có đúng 24 ký tự hex (ví dụ: "664c39b83b4822001bb0a112")
 *    - kiểm tra ID hợp lệ trước khi query database
 *
 * 2. z.object({...}) lồng nhau : Validate nested object
 *    - Trường "schedule" trong Class Model là một object con chứa daysOfWeek, startTime, endTime
 *    - Zod cho phép lồng z.object() bên trong z.object() để validate cấu trúc lồng nhau
 *
 * 3. z.coerce.date() : Tự động chuyển đổi string thành Date
 *    - Client gửi lên: "2026-06-01" (string)
 *    - Zod tự động chuyển thành: Date object (giống new Date("2026-06-01"))
 *    - "coerce" (cưỡng ép) = ép kiểu tự động
 *
 * 4. .refine() → Validation tùy chỉnh (custom validation)
 */
export const createClassSchema = z.object({
  classCode: z
    .string({ required_error: "Mã lớp là bắt buộc" })
    .min(1, "Mã lớp không được để trống"),

  // courseId phải là chuỗi 24 ký tự (MongoDB ObjectId format)
  courseId: z
    .string({ required_error: "Khóa học là bắt buộc" })
    .length(24, "courseId không hợp lệ"),

  // teacherId cũng là ObjectId
  teacherId: z
    .string({ required_error: "Giáo viên là bắt buộc" })
    .length(24, "teacherId không hợp lệ"),

  room: z.string().optional(),

  maxStudents: z
    .number({ required_error: "Sĩ số tối đa là bắt buộc" })
    .positive("Sĩ số phải là số dương"),

  // z.coerce.date() tự động chuyển "2026-06-01" (string) => Date object
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  status: z.enum(["active", "inactive", "completed"]).optional(),

  // schedule là một nested object (object lồng bên trong object)
  schedule: z
    .object({
      // Mảng các ngày trong tuần (0 = Chủ Nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
      daysOfWeek: z
        .array(z.number().min(0).max(6))
        .min(1, "Phải chọn ít nhất 1 ngày học"),

      // Giờ bắt đầu, định dạng HH:MM
      // .refine() kiểm tra tùy chỉnh: chuỗi phải khớp pattern "09:00", "14:30"...
      startTime: z
        .string()
        .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
          message: "Thời gian bắt đầu phải có định dạng HH:MM (ví dụ: 09:00)",
        }),

      endTime: z
        .string()
        .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
          message: "Thời gian kết thúc phải có định dạng HH:MM (ví dụ: 10:30)",
        }),
    })
    .optional(),
});

/**
 * Schema cho UPDATE — tất cả trường thành optional
 */
export const updateClassSchema = createClassSchema.partial();
