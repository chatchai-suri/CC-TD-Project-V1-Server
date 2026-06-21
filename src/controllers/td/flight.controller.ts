import type { Request, Response } from "express";
import { prisma } from "../../prisma.js"; //
import createError from "../../utils/createError.js"; //

// 🎯 POST: api/v1/td/flight/setupFlightWithMembers (ลอจิกการสร้างก๊วนพร้อมสมาชิก)
export const setupFlightWithMembers = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  // รับไอดีทัวร์นาเมนต์, ชื่อก๊วน, เวลาทีออฟ และอาร์เรย์ของไอดีนักกอล์ฟที่จะยัดลงก๊วนนี้ (สูงสุด 4-5 คน)
  const { tournament_id, flight_name, t_off_time, user_ids } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!tournament_id || !flight_name) {
    throw createError(
      400,
      "ข้อมูลไม่ครบถ้วน: กรุณาระบุระเบียบ tournament_id และ flight_name ด้วยครับป๋า!",
    );
  }

  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    throw createError(
      400,
      "จัดก๊วนล้มเหลว: ก๊วนกอล์ฟจำเป็นต้องมีรายชื่อนักกอล์ฟอย่างน้อย 1 คนครับ!",
    );
  }

  // ============================================================
  // 4. ACTION STEPS (ใช้ความสามารถของ Prisma 7 ทำ Transaction ป้องกันข้อมูลตกหล่น)
  // ============================================================
  const result = await prisma.$transaction(async (tx) => {
    // สเต็ป 4.1: สร้างตารางแม่ก๊วนทีออฟ (Flight) ก่อน
    const newFlight = await tx.flight.create({
      // [cite: 1, 10]
      data: {
        tournament_id: Number(tournament_id), // [cite: 1, 10]
        flight_name, // [cite: 1, 10]
        t_off_time: t_off_time || null, // [cite: 1, 11]
      },
    });

    // สเต็ป 4.2: แปลงร่าง user_ids ให้กลายเป็นก้อนพัสดุเตรียมหยอดลงตารางลูก (FlightMember)
    const memberData = user_ids.map((id: number) => ({
      flight_id: newFlight.flight_id, // 👈 ใช้ไอดีที่เพิ่งงอกมาจากสเต็ปบน [cite: 1, 11, 13]
      user_id: Number(id), // [cite: 1, 13]
      handicap_claim: 0, // ค่าเริ่มต้นรอเคลมแฮนดิแคปหน้างาน [cite: 1, 13]
    }));

    // สเต็ป 4.3: ยิงถล่มบันทึกสมาชิกลงก๊วนพร้อมกันในคำสั่งเดียว (Bulk Create)
    // ⚠️ Note: ข้อบังคับ @@unique([flight_id, user_id]) ในตู้ MySQL จะทำงานคุ้มครองทันที ดักนักกอล์ฟลงซ้ำก๊วน! [cite: 1, 13]
    await tx.flightMember.createMany({
      data: memberData,
    });

    // ดึงข้อมูลที่สลักเสร็จสรรพออกมารายงานตัว
    const fullFlightInfo = await tx.flight.findUnique({
      // [cite: 1, 10]
      where: { flight_id: newFlight.flight_id }, // [cite: 1, 11]
      include: {
        members: {
          // [cite: 1, 11]
          include: {
            user: {
              omit: { password: true }, // [cite: 1, 11] ดึงข้อมูลยูสเซอร์แต่ไม่เอาพาสเวิร์ดออกมาด้วย
            },
          },
        },
      },
    });

    return fullFlightInfo;
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(201).json({
    success: true,
    message: `เนรมิตกลุ่มก๊วน "${flight_name}" พร้อมบรรจุรายชื่อนักกอล์ฟ ${user_ids.length} ท่านลงระบบสำเร็จครับ! ⛳`,
    data: result,
  });
};

// 🎯 PUT: api/v1/td/flight/changeFlightName (ลอจิกการแก้ไขชื่อก๊วนหรือเวลาทีออฟ)
export const updateFlightInfo = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  const { flight_id, flight_name, t_off_time } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!flight_id) {
    throw createError(400, "ไม่สามารถแก้ไขได้: กรุณาระบุรหัสระเบียบ flight_id ด้วยครับป๋า!");
  }

  // ============================================================
  // 4. ACTION STEPS (สั่งค้อนเหล็ก Prisma สับเปลี่ยนข้อมูล)
  // ============================================================
  const updatedFlight = await prisma.flight.update({
    where: { flight_id: Number(flight_id) },
    data: {
      flight_name: flight_name || undefined, // 👈 ถ้าหน้าบ้านไม่ส่งมา ให้คงค่าเดิมไว้ ไม่เปลี่ยนเป็น null
      t_off_time: t_off_time !== undefined ? t_off_time : undefined
    }
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(200).json({
    success: true,
    message: `ปรับแต่งข้อมูลกลุ่มก๊วนดีเทลใหม่สำเร็จเรียบร้อยครับป๋า! ⛳`,
    data: updatedFlight
  });
};

// 🎯 PUT: api/v1/td/flight/changeFlightMembers (ลอจิกการล้างไพ่จัดสมาชิกก๊วนใหม่สดหน้างาน)
export const changeFlightMembers = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  const { flight_id, user_ids } = req.body; // รับไอดีก๊วน และ Array รายชื่อนักกอล์ฟชุดใหม่ล่าสุด

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!flight_id) {
    throw createError(400, "สลับสมาชิกล้มเหลว: กรุณาระบุ flight_id เป้าหมายด้วยครับป๋า!");
  }

  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    throw createError(400, "สลับสมาชิกล้มเหลว: ก๊วนกอล์ฟจำเป็นต้องมีรายชื่อสมาชิกอย่างน้อย 1 คนครับ!");
  }

  // ============================================================
  // 4. ACTION STEPS (ใช้ระเบียบ All-or-Nothing เคลียร์เก่า-ยัดใหม่ ป้องกันข้อมูลชนกัน)
  // ============================================================
  const result = await prisma.$transaction(async (tx) => {
    
    // สเต็ป 4.1: สั่งล้างท่อ ลบรายชื่อนักกอล์ฟชุดเก่าทุกคนในก๊วนนี้ออกให้เกลี้ยงก่อน
    await tx.flightMember.deleteMany({
      where: { flight_id: Number(flight_id) }
    });

    // สเต็ป 4.2: ขึ้นรูปก้อนพัสดุอาร์เรย์สมาชิกชุดใหม่มารองรับ
    const newMembers = user_ids.map((id: number) => ({
      flight_id: Number(flight_id),
      user_id: Number(id),
      handicap_claim: 0 // ค่าเริ่มต้นรอรีเซ็ตหน้างาน
    }));

    // สเต็ป 4.3: ยิงคำสั่งพหูพจน์ Bulk Create บรรจุรายชื่อใหม่ลงตู้ MySQL
    await tx.flightMember.createMany({
      data: newMembers
    });

    // ดึงข้อมูลที่สับเปลี่ยนเสร็จสมบูรณ์พร้อมกรอง Password ตามกฎเหล็กความปลอดภัย
    const fullFlightInfo = await tx.flight.findUnique({
      where: { flight_id: Number(flight_id) },
      include: {
        members: {
          include: {
            user: {
              omit: { password: true } // 👈 คุ้มครองความปลอดภัยตาม Working Rule 4.3
            }
          }
        }
      }
    });

    return fullFlightInfo;
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(200).json({
    success: true,
    message: "ล้างไพ่จัดสรรนักกอล์ฟลงก๊วนตัวจริงชุดใหม่เรียบร้อยครับป๋าปู! 🏌️‍♂️🔥",
    data: result
  });
};