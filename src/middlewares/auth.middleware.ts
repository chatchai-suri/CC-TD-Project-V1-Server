// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/createError.js';

export interface AuthPayload {
  user_id: number;
  username: string;
  global_role: string;
}

// 🛡️ ขยาย Type ของ Express Request ให้รู้จัก req.user ป้องกันเส้นแดง Linter
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * 🔒 1. Authenticate: ด่านตรวจตั๋ว JWT ว่ามีตั๋วมาไหม ถูกต้อง และหมดอายุหรือยัง
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // ตรวจสอบว่ามี Header Authorization รูปแบบ Bearer <token> หรือไม่
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError(401, 'การเข้าถึงถูกปฏิเสธ: กรุณาแนบ Token ผ่าน Header Authorization ด้วยครับ');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'golf_td_dev_secret_key_2026'
    ) as AuthPayload;

    // ฝังข้อมูลตัวตนลง req.user เพื่อให้ Controller / Middleware ด่านถัดไปหยิบใช้ได้ทันที
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw createError(401, 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้งครับ');
    }
    throw createError(401, 'Token ไม่ถูกต้องหรือถูกดัดแปลง');
  }
};

/**
 * 👑 2. Authorize: ด่านตรวจระดับสิทธิ์ (Role Guard) เช่น บังคับเฉพาะ TD หรือ ADMIN
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createError(401, 'ไม่พบข้อมูลยืนยันตัวตนของผู้ใช้งาน');
    }

    if (!allowedRoles.includes(req.user.global_role)) {
      throw createError(403, `สิทธิ์ [${req.user.global_role}] ไม่ได้รับอนุญาตให้เข้าถึงพื้นที่นี้ครับ!`);
    }

    next();
  };
};