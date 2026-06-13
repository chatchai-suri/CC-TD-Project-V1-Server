import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; // นามสกุล .js ตามข้อบังคับโมดูลสากล

// 🎯 POST: admin/course/register หรือ td/course/register
export const registerCourse = async (req: Request, res: Response) => {
  // แกะกล่องข้อมูลจาก Postman ตามพิมพ์เขียวใน TD-Service.md ของป๋า
  const { course_name, section_name, hole_number, par, distance_yards } = req.body;

  // สั่ง Prisma ทลายกำแพง SSH พอร์ต 3307 ไปสลักข้อมูลลง MySQL เครื่อง pp1
  // ⚠️ Note: เจ็มคุงใช้ฟีลด์หลักให้สอดคล้องกับ schema.prisma เบื้องต้น ป๋าสามารถสลับปรับเปลี่ยนตามฟีลด์จริงได้เลยครับ
  const newCourse = await prisma.course.create({
    data: {
      course_name: course_name,
      location: section_name || "ชลบุรี", // ใช้ค่าฟีลด์ที่มีในโมเดลเป็นจุดรับส่งชั่วคราว
    },
  });

  res.status(201).json({
    success: true,
    message: `สลักข้อมูลสนามกอล์ฟ ${course_name} ลงฐานข้อมูลผ่านอุโมงค์สำเร็จเรียบร้อยครับป๋า! ⛳`,
    data: newCourse,
  });
};