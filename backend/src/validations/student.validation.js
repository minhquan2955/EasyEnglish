import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  
  studentCode: z.string().min(1, "Mã học sinh không được để trống"),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["male", "female"]).optional(),
  parentIds: z.array(z.string().length(24, "Id phụ huynh không hợp lệ")).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
  }).optional(),
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống").optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  
  studentCode: z.string().min(1, "Mã học sinh không được để trống").optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["male", "female"]).optional(),
  parentIds: z.array(z.string().length(24, "Id phụ huynh không hợp lệ")).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
  }).optional(),
});
