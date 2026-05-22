import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("5000"),
  MONGO_URI: z.string().url("MONGO_URI must be a valid URL"),
  JWT_SECRET: z
    .string()
    .min(10, "JWT_SECRET must be at least 10 characters long"),
});

// Kiểm tra toàn bộ process.env theo định dạng envSchema
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("ENV ERROR (.env):", _env.error.format());
  process.exit(1); // Dừng server ngay lập tức nếu thiếu biến môi trường
}

export const env = _env.data;
