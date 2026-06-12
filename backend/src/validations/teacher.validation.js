import { z } from "zod";

export const createTeacherSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  
  employeeCode: z.string().min(1, "Mã giáo viên không được để trống"),
  specializations: z.array(z.string()).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuedBy: z.string(),
    year: z.number()
  })).optional(),
  weeklySessionLimit: z.number().optional(),
  salary: z.object({
    type: z.enum(["hourly", "fixed"]).optional(),
    amount: z.number().optional()
  }).optional(),
  joinDate: z.coerce.date().optional()
});

export const updateTeacherSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống").optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
  
  employeeCode: z.string().min(1, "Mã giáo viên không được để trống").optional(),
  specializations: z.array(z.string()).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuedBy: z.string(),
    year: z.number()
  })).optional(),
  weeklySessionLimit: z.number().optional(),
  salary: z.object({
    type: z.enum(["hourly", "fixed"]).optional(),
    amount: z.number().optional()
  }).optional(),
  joinDate: z.coerce.date().optional()
});
