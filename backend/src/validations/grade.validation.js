import { z } from "zod";

/**
 * Schema validate khi TẠO MỚI điểm số
 *
 * z.refine() — Cross-field Validation
 *
 * cần kiểm tra MỐI QUAN HỆ giữa 2 trường:
 *   score <= maxScore  -> score phụ thuộc vào maxScore
 *
 * z.refine(callback, options):
 *   - callback: nhận TOÀN BỘ object đã parse => trả về true/false
 *   - options.message: thông báo lỗi nếu callback trả false
 *   - options.path: trường nào sẽ hiển thị lỗi (mặc định là root)
 */
export const createGradeSchema = z
  .object({
    studentId: z
      .string({ required_error: "Học sinh là bắt buộc" })
      .length(24, "studentId không hợp lệ"),

    classId: z
      .string({ required_error: "Lớp học là bắt buộc" })
      .length(24, "classId không hợp lệ"),

    assessmentType: z.enum(
      ["midterm", "final", "quiz", "homework", "speaking", "writing"],
      {
        errorMap: () => ({
          message:
            "Loại bài phải là: midterm, final, quiz, homework, speaking, hoặc writing",
        }),
      },
    ),

    title: z
      .string({ required_error: "Tên bài kiểm tra là bắt buộc" })
      .min(1, "Tên bài không được để trống")
      .max(200, "Tên bài không quá 200 ký tự"),

    score: z
      .number({ required_error: "Điểm là bắt buộc" })
      .min(0, "Điểm không được âm"),

    maxScore: z
      .number({ required_error: "Điểm tối đa là bắt buộc" })
      .min(1, "Điểm tối đa phải lớn hơn 0"),

    feedback: z.string().max(1000, "Nhận xét không quá 1000 ký tự").optional(),
  })
  // refine: kiểm tra score <= maxScore SAU KHI đã validate từng trường
  .refine((data) => data.score <= data.maxScore, {
    // data: 1 object chứa các trường đã validate
    message: "Điểm không được vượt quá điểm tối đa",
    path: ["score"], // Lỗi sẽ hiển thị ở trường "score"
  });

/**
 * Schema validate khi CẬP NHẬT điểm số
 *
 * Dùng .partial() trước, rồi refine() sau.
 * refine() chỉ kiểm tra khi CẢ HAI trường score và maxScore được gửi.
 */
export const updateGradeSchema = z
  .object({
    assessmentType: z
      .enum(["midterm", "final", "quiz", "homework", "speaking", "writing"], {
        errorMap: () => ({
          message:
            "Loại bài phải là: midterm, final, quiz, homework, speaking, hoặc writing",
        }),
      })
      .optional(),

    title: z
      .string()
      .min(1, "Tên bài không được để trống")
      .max(200, "Tên bài không quá 200 ký tự")
      .optional(),

    score: z.number().min(0, "Điểm không được âm").optional(),

    maxScore: z.number().min(1, "Điểm tối đa phải lớn hơn 0").optional(),

    feedback: z.string().max(1000, "Nhận xét không quá 1000 ký tự").optional(),
  })
  // Chỉ kiểm tra score vs maxScore khi CẢ HAI đều được gửi
  .refine(
    (data) => {
      if (data.score !== undefined && data.maxScore !== undefined) {
        return data.score <= data.maxScore;
      }
      return true; // Nếu chỉ gửi 1 trong 2, bỏ qua kiểm tra này
    },
    {
      message: "Điểm không được vượt quá điểm tối đa",
      path: ["score"],
    },
  );
