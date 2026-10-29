// src/routers/auth.routes.ts
import { Router } from 'express';
import { registerUser, login } from '../controllers/auth/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.schema.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const authRouter = Router();

// 🔓 Public Endpoints (ใครก็เข้าถึงได้)
authRouter.post('/register', validateBody(registerSchema), registerUser);
authRouter.post('/login', validateBody(loginSchema), login);

// 🔒 Protected Endpoint (ต้องมี Token ที่ถูกต้องเท่านั้น)
authRouter.get('/me', authenticate, (req: any, res) => {
  return res.status(200).json({
    success: true,
    message: 'ยืนยันตัวตนสำเร็จครับ ⛳',
    user: req.user // ข้อมูลที่ถอดรหัสได้จาก JWT (user_id, username, global_role)
  });
});

export default authRouter;