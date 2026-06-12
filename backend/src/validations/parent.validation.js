import { z } from "zod";

export const createParentSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  
  studentIds: z.array(z.string().length(24, "Id học sinh không hợp lệ")).optional(),
  relationship: z.enum(["father", "mother", "guardian"]).optional()
});

export const updateParentSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống").optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  
  studentIds: z.array(z.string().length(24, "Id học sinh không hợp lệ")).optional(),
  relationship: z.enum(["father", "mother", "guardian"]).optional()
});
