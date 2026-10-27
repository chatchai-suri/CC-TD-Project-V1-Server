import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // เพิ่มการนำเข้า CORS เพื่อจัดการกับปัญหา Cross-Origin Resource Sharing
import helmet from 'helmet'; // เพิ่มการนำเข้า Helmet เพื่อเพิ่มความปลอดภัยให้กับแอปพลิเคชัน
import errorMiddleware from './middlewares/error.middleware.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่
import { prisma } from './config/prisma.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่ 
import mainRouter from './routers/main.routes.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่

// ปลุกพลังให้ Node.js อ่านค่าจากไฟล์ .env เข้าไปในระบบ
dotenv.config();

const app = express();
const PORT = process.env.PORT || "8500"; // ใช้พอร์ตจาก .env หรือดีฟอลต์เป็น 8500 แต่ลองแก้ดีฟอลต์เป็น "" 
// const HOST = process.env.HOST || "localhost"; // หากไม่มีค่าใน env ให้ถอยกลับมา localhost ปลอดภัยไว้ก่อน
const HOST = process.env.HOST || "0.0.0.0"; // 🟢 ปลอดภัยแน่นอน! รับฟังทุก network interface

app.use(express.json());

// ========================================================
// 🛡️ 1. HELMET: ป้องกัน Header โจมตี (XSS, Clickjacking, Sniffing)
// ========================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // เปิดทางให้โหลด Avatar/Assets ข้ามโดเมนได้ไม่ติดบล็อก
}));

// ========================================================
// 🔒 2. STRICT CORS: ล็อกเฉพาะโดเมนของระบบที่อนุญาตเท่านั้น
// ========================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://golf-td.chatchaidev.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // ยอมรับคำขอที่ไม่มี origin (เช่น Postman, cURL, Mobile apps) หรือ origin ที่ระบุใน Whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: Origin not allowed'));
    }
  },
  credentials: true
}));

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

// ลอจิกเดิมที่อาจจะเป็น: app.listen(8500, () => { ... })
// 💡 ให้แก้ไขเปลี่ยนเป็นระบุ "0.0.0.0" เพื่อเปิดประตูเครือข่ายรับทุกไอพีสากลนิยม:
// หรือเจาะจงล็อกให้รับฟังสัญญาณเฉพาะเลขไอพี Tailscale เท่านั้น เช่น app.listen(8500, "100.65.78.122")

app.listen(Number(PORT), HOST, () => {
  console.log("🚀 ==========================================");
  console.log(`🎯 Server is Listening on http://${HOST}:${PORT}`);
  console.log("🚀 ==========================================");
});