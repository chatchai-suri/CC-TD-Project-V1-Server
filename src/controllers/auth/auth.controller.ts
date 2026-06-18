import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; //
import createError from '../../utils/createError.js'; // ดึงคัมภีร์ตัวกลางมาใช้งาน (.js เสมอตามระเบียบ)

export const registerUser = async (req: Request, res: Response) => {
  const { username, password, confirmPassword } = req.body;

  // 🎯 ตรวจสอบสิทธิ์ด่านแรก: ถ้ารหัสไม่ตรงกัน สั่งโยนก้อน Error ด้วยบรรทัดเดียวสั้น ๆ ได้เลยครับป๋า
  if (password !== confirmPassword) {
    // โยนก้อนผิดพลาดรหัส 400 ออกไปให้ Express 5 จัดการส่งต่อไปที่ส่วนกลางเองอัตโนมัติ
    throw createError(400, "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับป๋าปู!");
  }

  const newPlayer = await prisma.user.create({
    data: {
      username,
      password,
      fullname: username,
      nickname: "นักกอล์ฟใหม่",
      global_role: "USER" //
    },
  });

  res.status(201).json({
    success: true,
    message: `เพิ่มรายชื่อนักกอล์ฟ ${username} สำเร็จเรียบร้อยครับ! 👤`,
    data: newPlayer,
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