// src/controllers/admin/admin.user.controller.ts
import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';
import { hashPassword } from '../../utils/password.util.js'; // 👈 นำเข้าตัวแฮช Argon2

// 🎯 POST: api/v1/admin/user/addGolfer (เพิ่มนักกอล์ฟใหม่พร้อมแฮชรหัสผ่าน)
export const addGolfer = async (req: Request, res: Response) => {
  const { username, password, confirmPassword, fullname, nickname, phone_number, age } = req.body;

  if (!username || !password) {
    throw createError(400, "กรุณาระบุ username และ password ให้ครบถ้วนด้วยครับป๋า!");
  }

  if (password !== confirmPassword) {
    throw createError(400, "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับป๋าปู!");
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw createError(400, `Username "${username}" นี้มีคนใช้ในสนามแล้วครับป๋า!`);
  }

  // 🔒 แฮชรหัสผ่านด้วย Argon2 ก่อนบันทึกเสมอ
  const hashedPassword = await hashPassword(password);

  const newPlayer = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      fullname: fullname || username,
      nickname: nickname || "นักกอล์ฟใหม่",
      phone_number: phone_number || null,
      age: age ? Number(age) : null,
      global_role: "GOLFER",
      profile_icon: "https://api.dicebear.com/7.x/adventurer/svg?seed=porn"
    },
  });

  return res.status(201).json({
    success: true,
    message: `เพิ่มรายชื่อนักกอล์ฟ ${username} สำเร็จเรียบร้อยครับ! 👤`,
    data: {
      user_id: newPlayer.user_id,
      username: newPlayer.username,
      fullname: newPlayer.fullname
    },
  });
};

// 🎯 POST: api/v1/admin/user/:id/reset-password (รีเซ็ตรหัสผ่านให้นักกอล์ฟ)
export const resetUserPassword = async (req: Request, res: Response) => {
  const userId = req.params.id || req.body.userId; // 👈 รองรับทั้ง /:id และส่งมาใน Body { "userId": 25 }
  const { newPassword } = req.body; // ถ้าระบุมาให้ใช้ค่าใหม่ ถ้าไม่ระบุให้ตั้งค่าเริ่มต้นเป็น "123456"

  if (!userId || isNaN(Number(userId))) {
    throw createError(400, "กรุณาระบุรหัสผู้ใช้งาน (userId) ให้ถูกต้องครับป๋า!");
  }

  const user = await prisma.user.findUnique({
    where: { user_id: Number(userId) }
  });

  if (!user) {
    throw createError(404, "ไม่พบข้อมูลนักกอล์ฟท่านนี้ในระบบครับ");
  }

  const targetPassword = newPassword || "123456";
  const hashedPassword = await hashPassword(targetPassword);

  await prisma.user.update({
    where: { user_id: Number(userId) },
    data: { password: hashedPassword }
  });

  return res.status(200).json({
    success: true,
    message: `รีเซ็ตรหัสผ่านของ ${user.fullname} เป็น "${targetPassword}" เรียบร้อยแล้วครับ 🔑`
  });
};

// 🎯 POST: api/v1/admin/user/changeRole
export const changeRole = async (req: Request, res: Response) => {
  const { userId, global_role } = req.body;

  if (!userId || !global_role) {
    throw createError(400, "กรุณาระบุ userId และ global_role ให้ครบถ้วนครับ!");
  }

  const updatedUser = await prisma.user.update({
    where: { user_id: Number(userId) },
    data: { global_role: String(global_role).toUpperCase() as any }
  });

  return res.status(200).json({
    success: true,
    message: `สลับบทบาท ${updatedUser.fullname} เป็นสิทธิ์ [${updatedUser.global_role}] เรียบร้อยครับ!`,
    data: {
      user_id: updatedUser.user_id,
      username: updatedUser.username,
      global_role: updatedUser.global_role
    }
  });
};

// 🎯 DELETE: api/v1/admin/user/delete/:id
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!userId || isNaN(Number(userId))) {
    throw createError(400, "กรุณาระบุรหัสผู้ใช้งานที่ต้องการลบครับ!");
  }

  try {
    await prisma.user.delete({
      where: { user_id: Number(userId) }
    });

    return res.status(200).json({
      success: true,
      message: `ลบผู้ใช้งาน ID: ${userId} เรียบร้อยแล้วครับ!`
    });
  } catch (error: any) {
    if (error.code === 'P2003') {
      throw createError(400, "ไม่สามารถลบนักกอล์ฟท่านนี้ได้ เนื่องจากมีคะแนนแข่งขันหรือมีชื่ออยู่ในก๊วนแล้วครับป๋า!");
    }
    throw error;
  }
};



// 🎯 PUT: api/v1/admin/user/update/:id (ระบบแก้ไขโปรไฟล์นักกอล์ฟ)
export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = req.params.id || req.body.user_id;
  const { username, fullname, nickname, phone_number, age, profile_icon } = req.body;

  if (!userId || isNaN(Number(userId))) {
    throw createError(400, "กรุณาระบุรหัสผู้ใช้งาน (userId) ให้ถูกต้องครับป๋า!");
  }

  const updatedUser = await prisma.user.update({
    where: { user_id: Number(userId) },
    data: {
      ...(username && { username }),
      ...(fullname && { fullname }),
      ...(nickname && { nickname }),
      ...(phone_number && { phone_number }),
      ...(age !== undefined && { age: Number(age) }),
      ...(profile_icon && { profile_icon }), // รองรับ Cloudinary / Image URL ในอนาคต
    },
    select: {
      user_id: true,
      username: true,
      fullname: true,
      nickname: true,
      age: true,
      profile_icon: true,
      global_role: true
    }
  });

  return res.status(200).json({
    success: true,
    message: `อัปเดตข้อมูลโปรไฟล์ของคุณ "${updatedUser.fullname}" เรียบร้อยครับป๋า!`,
    data: updatedUser
  });
};
