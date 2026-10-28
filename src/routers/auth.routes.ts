// src/routers/auth.routes.ts
import { Router } from 'express';
import { registerUser, login } from '../controllers/auth/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.schema.js';

const authRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/auth
authRouter.post('/register', validateBody(registerSchema), registerUser);
authRouter.post('/login', validateBody(loginSchema), login);

export default authRouter;