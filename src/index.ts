import express from 'express';
import dotenv from 'dotenv';
import { prisma } from './prisma.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่ 

// ปลุกพลังให้ Node.js อ่านค่าจากไฟล์ .env เข้าไปในระบบ
dotenv.config();

const app = express();
const PORT = process.env.PORT || "8500"; // ใช้พอร์ตจาก .env หรือดีฟอลต์เป็น 8500 แต่ลองแก้ดีฟอลต์เป็น "" 

app.use(express.json());


// เปิดประตูบานแรกให้เซิร์ฟเวอร์ตื่นทำงาน
app.listen(PORT, () => {
  console.log(`🚀 ============================================`);
  console.log(`🎯 Server is Listening on Port ${PORT}`);
  console.log(`🚀 ============================================`);
});