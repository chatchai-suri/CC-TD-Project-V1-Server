import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // เพิ่มการนำเข้า CORS เพื่อจัดการกับปัญหา Cross-Origin Resource Sharing
import helmet from 'helmet'; // เพิ่มการนำเข้า Helmet เพื่อเพิ่มความปลอดภัยให้กับแอปพลิเคชัน
import errorMiddleware from './middlewares/error.middleware.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่
import { prisma } from './prisma.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่ 
import mainRouter from './routers/main.routes.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่

// ปลุกพลังให้ Node.js อ่านค่าจากไฟล์ .env เข้าไปในระบบ
dotenv.config();

const app = express();
const PORT = process.env.PORT || "8500"; // ใช้พอร์ตจาก .env หรือดีฟอลต์เป็น 8500 แต่ลองแก้ดีฟอลต์เป็น "" 

app.use(express.json());
app.use(cors());
app.use(helmet());

// 🎯 สเต็ป 3: เส้นทางทดสอบสุขภาพหน้าด่านระดับพื้นฐาน (ใช้เช็คว่าเซิร์ฟเวอร์ตื่นหรือยัง)
app.get('/', (req, res) => {
  res.json({ message: "สวัสดีครับป๋า! ระบบ Tournament Director API พร้อมทำงานข้ามมิติแล้วครับ ⛳" });
});

// API routes would go here
app.use('/api/v1', mainRouter); // นำเข้า mainRouter ที่รวมทุกเส้นทางย่อยไว้แล้ว

// handling errors 404 not found
app.use((req, res) => {
  res.status(404)
  .json({message: `path not found ${req.method} ${req.originalUrl}`});
});

// Global error handling middleware
app.use(errorMiddleware);

// เปิดประตูบานแรกให้เซิร์ฟเวอร์ตื่นทำงาน
app.listen(PORT, () => {
  console.log(`🚀 ==================yes==========================`);
  console.log(`🎯 Server is Listening on Port ${PORT}`);
  console.log(`🔗 Test GET: http://localhost:${PORT}/api/golf-courses`);
  console.log(`🚀 ============================================`);
});