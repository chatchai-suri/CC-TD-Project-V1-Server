// src/controllers/admin/admin.user.controller.ts
import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';

// 🎯 POST: api/v1/admin/user/addGolfer (ระบบเพิ่มนักกอล์ฟโดย Admin/TD)
export const addGolfer = async (req: Request, res: Response) => {
  const { username, password, confirmPassword, fullname, nickname, phone_number, age } = req.body;

  if (!username || !password) {
    throw createError(400, "กรุณาระบุ username และ password ให้ครบถ้วนด้วยครับป๋า!");
  }

  // 🎯 ตรวจสอบสิทธิ์ด่านแรก: ถ้ารหัสไม่ตรงกัน สั่งโยนก้อน Error
  if (password !== confirmPassword) {
    throw createError(400, "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับป๋าปู!");
  }

  // ดักจับรายชื่อยูสเซอร์เนมซ้ำซ้อนใน DB
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw createError(400, `Username "${username}" นี้มีคนใช้ในสนามแล้วครับป๋า!`);
  }

  const newPlayer = await prisma.user.create({
    data: {
      username,
      password,
      fullname: fullname || username,
      nickname: nickname || "นักกอล์ฟใหม่",
      phone_number: phone_number || null,
      age: age ? Number(age) : null,
      global_role: "GOLFER"
    },
  });

  return res.status(201).json({
    success: true,
    message: `เพิ่มรายชื่อนักกอล์ฟ ${username} สำเร็จเรียบร้อยครับ! 👤`,
    data: newPlayer,
  });
};

// 🎯 POST: api/v1/admin/user/changeRole (ระบบคุมสิทธิ์เปลี่ยนตำแหน่งนักกอล์ฟ)
export const changeRole = async (req: Request, res: Response) => {
  const { username, userId, global_role } = req.body;

  if ((!username && !userId) || !global_role) {
    throw createError(400, "ไม่สามารถเปลี่ยนสิทธิ์ได้: กรุณาระบุ username/userId และ global_role ให้ครบถ้วนครับป๋า!");
  }

  // ค้นหายูสเซอร์ตัวจริงในระบบก่อนสั่งอัปเดต
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ user_id: Number(userId) }] : []),
        ...(username ? [{ username: String(username) }] : [])
      ]
    }
  });

  if (!userExists) {
    throw createError(404, "ไม่พบชื่อยูสเซอร์นี้ในสนามกอล์ฟของเราครับป๋า!");
  }

  const updatedUser = await prisma.user.update({
    where: { user_id: userExists.user_id },
    data: { global_role: String(global_role).toUpperCase() as any }
  });

  return res.status(200).json({
    success: true,
    message: `สลับบทบาทนักกอล์ฟ ${updatedUser.fullname} เป็นสิทธิ์ [${updatedUser.global_role}] เรียบร้อยครับป๋า! 👤`,
    data: {
      user_id: updatedUser.user_id,
      username: updatedUser.username,
      global_role: updatedUser.global_role
    }
  });
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

// 🎯 DELETE: api/v1/admin/user/delete/:id (ระบบลบผู้ใช้งานออกจากระบบ)
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id || req.body.user_id;

  if (!userId || isNaN(Number(userId))) {
    throw createError(400, "กรุณาระบุรหัสผู้ใช้งานที่ต้องการลบครับป๋า!");
  }

  await prisma.user.delete({
    where: { user_id: Number(userId) }
  });

  return res.status(200).json({
    success: true,
    message: `ลบผู้ใช้งาน ID: ${userId} ออกจากระบบเรียบร้อยครับป๋า!`
  });
};