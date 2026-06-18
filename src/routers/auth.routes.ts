import {Router} from 'express';
import { registerUser } from '../controllers/auth/auth.controller.js'; // แก้ไขชื่อฟังก์ชันให้ตรงกับที่ export จริงใน auth.controller.ts
import { login } from '../controllers/auth/auth.controller.js';

const authRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/auth
authRouter.post('/register', registerUser);
authRouter.post('/login', login);
authRouter.post('/getCurrUser', (req, res) => {});

export default authRouter;