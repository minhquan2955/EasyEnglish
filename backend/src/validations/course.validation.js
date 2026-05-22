import { z } from "zod";

/**
 * Schema validate khi TẠO khóa học mới (POST)
 *
 * - z.string()        bắt buộc là chuỗi
 * - .min(1, "...")     không được để trống, kèm thông báo lỗi tùy chỉnh
 * - z.number()        bắt buộc là số
 * - .positive("...")  phải là số dương (> 0)
 * - z.enum([...])     chỉ cho phép các giá trị trong danh sách
 * - .optional()       trường này KHÔNG bắt buộc (có thể không gửi lên)
 */
export const createCourseSchema = z.object({
  code: z
    .string({ required_error: "Mã khóa học là bắt buộc" })
    .min(1, "Mã khóa học không được để trống"),

  name: z
    .string({ required_error: "Tên khóa học là bắt buộc" })
    .min(1, "Tên khóa học không được để trống"),

  category: z.enum(["ielts", "nursery", "kids", "teens"], {
    errorMap: () => ({
      message: "Danh mục phải là: ielts, nursery, kids, teens",
    }),
  }),

  totalSessions: z
    .number({ required_error: "Tổng số buổi học là bắt buộc" })
    .positive("Tổng số buổi phải là số dương"),

  sessionDurationMins: z
    .number({ required_error: "Thời lượng buổi học là bắt buộc" })
    .positive("Thời lượng phải là số dương"),

  tuitionFee: z
    .number({ required_error: "Học phí là bắt buộc" })
    .positive("Học phí phải là số dương"),

  // curriculum là mảng, không bắt buộc khi tạo (có thể thêm sau)
  curriculum: z
    .array(
      z.object({
        sessionNo: z.number().positive("Số buổi phải là số dương"),
        topic: z.string().min(1, "Chủ đề không được để trống"),
        materials: z.string().optional(),
      }),
    )
    .optional(),
});

/**
 * Schema validate khi CẬP NHẬT khóa học (PUT)
 *
 * Dùng .partial() - biến TẤT CẢ các trường thành optional
 * Nghĩa là khi cập nhật, admin chỉ cần gửi những trường muốn thay đổi,
 * không cần gửi lại toàn bộ thông tin.
 *
 * Ví dụ: Chỉ muốn đổi học phí : { tuitionFee: 5000000 } là đủ
 */
export const updateCourseSchema = createCourseSchema.partial();
