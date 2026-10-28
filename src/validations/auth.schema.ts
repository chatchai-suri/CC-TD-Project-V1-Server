// src/validations/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, "Username ต้องมีอย่างน้อย 3 ตัวอักษร").max(20, "Username ไม่เกิน 20 ตัวอักษร").trim(),
  password: z.string().min(6, "Password ต้องมีอย่างน้อย 6 ตัวอักษร"),
  fullname: z.string().min(1, "กรุณาระบุชื่อ-นามสกุลจริง"),
  nickname: z.string().optional(),
  phone_number: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional().transform((val) => (val ? Number(val) : undefined)),
});

export const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอก Username ด้วยครับ"),
  password: z.string().min(1, "กรุณากรอก Password ด้วยครับ"),
});