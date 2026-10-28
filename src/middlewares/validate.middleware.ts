// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

/**
 * Middleware สำหรับ Validate req.body ด้วย Zod Schema
 * (ใน Express 5 หากโยน Error หรือ ZodError จะไหลเข้า errorMiddleware อัตโนมัติ)
 */
export const validateBody = (schema: ZodType ) => (req: Request, res: Response, next: NextFunction) => {
  req.body = schema.parse(req.body);
  next();
};