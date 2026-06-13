import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; //
import createError from '../../utils/createError.js'; // ดึงคัมภีร์ตัวกลางมาใช้งาน (.js เสมอตามระเบียบ)

export const addGolfer = async (req: Request, res: Response) => {
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