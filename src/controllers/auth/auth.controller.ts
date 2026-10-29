// src/controllers/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';
import { hashPassword, verifyPassword } from '../../utils/password.util.js';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, fullname, nickname, phone_number, age } = req.body;

  // 1. ตรวจสอบ Username ซ้ำ
  if (username) {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      throw createError(400, `Username "${username}" นี้มีคนใช้ในสนามแล้วครับป๋า!`);
    }
  }

  // 2. แฮชรหัสผ่านด้วย Argon2
  const hashedPassword = password ? await hashPassword(password) : null;

  // 3. บันทึกลงฐานข้อมูล
  const newUser = await prisma.user.create({
    data: {
      username: username || null,
      password: hashedPassword,
      fullname,
      nickname: nickname || null,
      phone_number: phone_number || null,
      age: age ?? null,
      global_role: "GOLFER"
    }
  });

  return res.status(201).json({
    success: true,
    message: `สลักชื่อนักกอล์ฟ "${fullname}" เข้าสู่ระบบเรียบร้อยแล้วครับ! 🏌️‍♂️`,
    data: {
      user_id: newUser.user_id,
      username: newUser.username,
      fullname: newUser.fullname
    }
  });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // 1. ค้นหาผู้ใช้
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !user.password) {
    throw createError(400, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้องครับ!");
  }

  // 2. ตรวจสอบรหัสผ่านด้วย Argon2 Verify
  const isMatch = await verifyPassword(user.password, password);
  if (!isMatch) {
    throw createError(400, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้องครับ!");
  }

  // 3. ออก JWT Token
  const token = jwt.sign(
    { 
      user_id: user.user_id, 
      username: user.username, 
      fullname: user.fullname,       // 👈 เติมลงใน Payload
      global_role: user.global_role,
      profile_icon: user.profile_icon // 👈 เติมลงใน Payload
    },
    process.env.JWT_SECRET || 'golf_td_dev_secret_key_2026',
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    success: true,
    message: `ยินดีต้อนรับกลับสู่สนามครับ [${user.global_role}] ⛳`,
    token,
    data: {
      user_id: user.user_id,
      username: user.username,
      fullname: user.fullname,
      global_role: user.global_role,
      profile_icon: user.profile_icon
    }
  });
};