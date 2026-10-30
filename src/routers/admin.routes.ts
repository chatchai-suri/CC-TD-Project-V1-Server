// src/routers/admin.routes.ts
import { Router } from 'express';
import { registerCourse } from '../controllers/admin/admin.course.controller.js';
import { 
  addGolfer, 
  changeRole, 
  updateUserProfile, 
  deleteUser,
  resetUserPassword
} from '../controllers/admin/admin.user.controller.js';
import { registerTournament } from '../controllers/admin/admin.tournament.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const adminRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/admin

// 🔒 ด่านตรวจกลาง: ล็อกทุก Endpoint ภายใต้ /api/v1/admin ให้เฉพาะ TD และ ADMIN เท่านั้น
adminRouter.use(authenticate, authorize('ADMIN', 'TD'));

// 🎯 หมวดการจัดการยูสเซอร์ (User Management)
adminRouter.post('/user/addGolfer', addGolfer);
adminRouter.post('/user/changeRole', changeRole);
adminRouter.put('/user/update/:id', updateUserProfile); // 👈 เชื่อมต่อระบบแก้ไขโปรไฟล์นักกอล์ฟ
adminRouter.delete('/user/delete/:id', deleteUser);       // 👈 เชื่อมต่อระบบลบผู้ใช้งานออกจากระบบ
adminRouter.post('/user/reset-password', resetUserPassword); // 👈 เชื่อมต่อระบบรีเซ็ตรหัสผ่าน

// 🎯 หมวดการจัดการสนามกอล์ฟ (Course Management)
adminRouter.post('/course/register', registerCourse);

// 🎯 หมวดการจัดการทัวร์นาเมนต์ (Tournament Management)
adminRouter.post('/tournament/register', registerTournament);
adminRouter.post('/tournament/editScore', (req, res) => {});
adminRouter.post('/tournament/close', (req, res) => {});

export default adminRouter;