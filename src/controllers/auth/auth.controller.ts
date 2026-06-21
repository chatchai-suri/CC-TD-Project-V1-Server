import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; // 👈 นามสกุล .js ตามระเบียบ ES Module ยุคใหม่ 
import createError from '../../utils/createError.js'; // 👈 ตัวดักจับ Error ส่วนกลาง 

// 🎯 POST: api/v1/auth/registerUser (ลอจิกการลงทะเบียนผู้ใช้)
export const registerUser = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  const { username, password, fullname, nickname, phone_number, age } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!fullname) {
    throw createError(400, "ไม่สามารถลงทะเบียนได้: กรุณาระบุชื่อ-นามสกุลจริงด้วยครับป๋า!");
  }

  // ดักจับ Username ซ้ำล่วงหน้าระดับแอป (Strict Checking)
  if (username) {
    const existingUser = await prisma.user.findUnique({ where: { username } }); // [cite: 1, 2]
    if (existingUser) {
      throw createError(400, `Username "${username}" นี้มีคนใช้ในสนามแล้วครับป๋า!`);
    }
  }

  // ============================================================
  // 4. ACTION STEPS (สลักข้อมูลลงตู้ MySQL ผ่านท่อ 3307)
  // ============================================================
  const newUser = await prisma.user.create({ // [cite: 1]
    data: {
      username: username || null, // [cite: 1, 2]
      password: password || null, // 👈 เฟสแรกยังไม่แฮช รันแบบ Simply Standard เพื่อเช็ค Data Flow 
      fullname, // [cite: 1, 3]
      nickname: nickname || null, // [cite: 1, 3]
      phone_number: phone_number || null, // [cite: 1, 4]
      age: age ? Number(age) : null, // 👈 มั่นใจว่าเป็น Int ป้องกัน Type เพี้ยนตอนเข้าฐานข้อมูล [cite: 1, 4, 7]
      global_role: "GOLFER" // 👈 ค่าเริ่มต้นสากลนิยม [cite: 1, 5]
    }
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(201).json({
    success: true,
    message: `สลักชื่อนักกอล์ฟ "${fullname}" เข้าสู่ระบบท่อฐานข้อมูลเรียบร้อยแล้วครับป๋า! 🏌️‍♂️`,
    data: {
      user_id: newUser.user_id, // [cite: 1]
      username: newUser.username, // [cite: 1, 2]
      fullname: newUser.fullname // [cite: 1, 3]
    }
  });
};

// 🎯 POST: api/v1/auth/login (ลอจิกดักเช็คพาสเวิร์ดนักกอล์ฟ)
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 1. ค้นหาชื่อยูสเซอร์ในถัง MySQL ผ่าน Prisma
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  // ⚠️ ถ้าไม่พบชื่อผู้ใช้งานในระบบ ให้โยน Error ตัวกลางที่ป๋าออกแบบไว้ทันที
  if (!user) {
    throw createError(404, "ไม่พบชื่อผู้ใช้งานนี้ในระบบคลับครับป๋า!");
  }

  // 2. ตรวจสอบรหัสผ่าน (ช่วงตั้งไข่เราเช็คสายอักขระตรง ๆ ก่อนครับ)
  if (user.password !== password) {
    throw createError(400, "รหัสผ่านไม่ถูกต้อง กรุณาเช็ควงสวิงอีกครั้งครับป๋า!");
  }

  // 3. ผ่านฉลุย ส่งข้อมูลความสำเร็จกลับไปให้หน้าบ้าน
  res.status(200).json({
    success: true,
    message: `ยินดีต้อนรับกลับสู่สนามครับ ป๋าได้สิทธิ์ในฐานะ [${user.global_role}] ⛳`,
    data: {
      user_id: user.user_id,
      username: user.username,
      fullname: user.fullname,
      global_role: user.global_role
    }
  });
};