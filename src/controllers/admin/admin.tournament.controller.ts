import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js'; // นามสกุล .js ตามข้อบังคับโมดูล[cite: 7]
import { createError } from '../../utils/createError.js';

/**
 * 🎯 คัมภีร์ควบคุม: ระบบลงทะเบียนแมตช์การแข่งขัน (Tournament Register)
 * Lifecycle Standard: 1 -> 2 -> 3 -> 4 -> n+1
 */
export const registerTournament = async (req: Request, res: Response) => {
  
  // ============================================================
  // 1. REQUEST MANAGEMENT (จัดการแกะกล่องนำเข้าข้อมูลจากหน้าด่าน)
  // ============================================================
  const { tournament_name, tournament_mode, use_age_option, course_id, event_date } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING (ตรวจตราคุณสมบัติและดักจับข้อผิดพลาด)
  // ============================================================
  // ดักเช็คชื่อแมตช์ห้ามว่างเปล่า เพื่อไม่ให้เอนจิ้นชั้นในเกิดอาการระเบิด
  if (!tournament_name) {
    throw createError(400, "ไม่สามารถสร้างแมตช์ได้: กรุณาระบุชื่อทัวร์นาเมนต์ให้ถูกต้องครับป๋า!");
  }

  // ============================================================
  // 4. ACTION STEPS (ขั้นตอนปฏิบัติการสลักข้อมูลลงขุมทรัพย์)
  // ============================================================
  // สเต็ป 4.1: นำก้อนพัสดุพิกัดข้ามเครือข่ายพอร์ต 3307 ไปหยอดใส่ตาราง MySQL[cite: 8]
  const newMatch = await prisma.tournament.create({
    data: {
      tournament_name,
      tournament_mode: tournament_mode || "Stroke Play", // ค่าสำรองถ้าหน้าจอไม่ส่งมา[cite: 9]
      use_age_option: use_age_option || false,           // ค่าสำรองสิทธิ์การคำนวณอายุ[cite: 9]
      course_id: Number(course_id),                      // มั่นใจว่าเป็น Number ป้องกันไทป์เพี้ยน[cite: 7]
      event_date: new Date(event_date),                  // ฟอร์แมตสายอักขระวันที่เข้าสู่ระบบเวลาสากล[cite: 20]
      status: "setup"                                    // ติดป้ายสถานะเตรียมพร้อมจัดก๊วนทีออฟ[cite: 9]
    }
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT (สรุปผลการเดินทางพ่นสัมฤทธิผลกลับหน้าบ้าน)
  // ============================================================
  res.status(201).json({
    success: true,
    message: `เนรมิตแมตช์แข่งขัน ${tournament_name} ลงระบบท่อฐานข้อมูลสำเร็จเรียบร้อยครับป๋า! 🏆`,
    data: newMatch
  });
};