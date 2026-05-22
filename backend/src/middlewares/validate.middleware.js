/**
 * Middleware kiểm tra dữ liệu đầu vào bằng Zod schema
 *
 * @param {ZodSchema} schema - Zod schema để validate req.body
 * @returns {Function} Express middleware
 *
 * Dùng trong routes:
 *   router.post("/teachers", protect, authorize("admin"), validate(createTeacherSchema), createTeacher)
 */

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400);

      //lấy danh sách lỗi
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return next(new Error(errorMessages));
    }
    //ghi đè req.body bằng dữ liệu đc Zod parse
    //bỏ các trường ko có trong schema
    req.body = result.data;
    next();
  };
};
