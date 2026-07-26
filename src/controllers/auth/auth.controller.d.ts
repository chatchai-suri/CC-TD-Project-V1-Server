import { Request, Response, NextFunction } from 'express';
/**
 * 🎯 POST: /api/v1/auth/register (ลอจิกการลงทะเบียนนักกอล์ฟและแคดดี้เข้าระบบ)
 * 🔒 เลเยอร์ 4 ชั้น Express v5 Compliance ปราศจาก Try-Catch บวมรกสายตา
 */
export declare const registerUser: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * 🎯 POST: /api/v1/auth/login (ลอจิกดักเช็คพาสเวิร์ดเพื่อแจกตั๋วสิทธิ์ควบคุม)
 * 🔒 เลเยอร์ 4 ชั้น Express v5 Compliance ไหลคลีนจากบนลงล่าง
 */
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map