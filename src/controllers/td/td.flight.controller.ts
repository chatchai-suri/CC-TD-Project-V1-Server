// src/controllers/td/td.flight.controller.ts
import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';

// =========================================================================
// 🎯 MODULE 1: ดึงผังจัดก๊วนทั้งหมดประจำทัวร์นาเมนต์ (Flight Setup View)
// 🎯 GET: api/v1/td/tournaments/:tournament_id/flights
// =========================================================================
export const getFlightSetup = async (req: Request, res: Response) => {
  const tournament_id = req.params.tournament_id || req.body.tournament_id;

  if (!tournament_id || isNaN(Number(tournament_id))) {
    throw createError(400, "กรุณาระบุรหัส tournament_id ให้ถูกต้องด้วยครับป๋า!");
  }

  const flights = await prisma.flight.findMany({
    where: { tournament_id: Number(tournament_id) },
    include: {
      members: {
        include: {
          user: {
            omit: { password: true },
            include: { scores: { include: { hole: true } } }
          }
        }
      }
    },
    orderBy: { flight_id: 'asc' }
  });

  // 🎯 Map สิทธิ์ Role สดๆ จาก DB (ยึดตาม global_role ของ User) ส่งกลับไปให้ Zustand Store
  const mappedFlights = flights.map(f => ({
    ...f,
    members: f.members.map(m => ({
      ...m,
      role: m.user.global_role || "GOLFER"
    }))
  }));

  return res.status(200).json({
    success: true,
    data: mappedFlights
  });
};

// =========================================================================
// 🎯 MODULE 2: สร้างก๊วนใหม่พร้อมยัดสมาชิกเข้ากลุ่ม
// 🎯 POST: api/v1/td/tournaments/:tournament_id/flights
// =========================================================================
export const setupFlightWithMembers = async (req: Request, res: Response) => {
  const tournament_id = req.params.tournament_id || req.body.tournament_id;
  const { flight_name, t_off_time, start_hole, user_ids } = req.body;

  if (!tournament_id || isNaN(Number(tournament_id))) {
    throw createError(400, "ไม่สามารถจัดก๊วนได้: รหัส tournament_id ไม่ถูกต้องครับป๋า!");
  }

  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    throw createError(400, "กรุณาเลือกนักกอล์ฟอย่างน้อย 1 คนเข้าก๊วนครับป๋า!");
  }

  const newFlight = await prisma.$transaction(async (tx) => {
    const flight = await tx.flight.create({
      data: {
        tournament_id: Number(tournament_id),
        flight_name: flight_name || "Group 01",
        t_off_time: t_off_time || "08:00",
        // start_hole: Number(start_hole) || 1,
        // ❌ ลบ start_hole: 1 หรือ start_hole ออกตรงนี้ครับ!
      }
    });

    const memberData = user_ids.map((u: any) => {
      const uId = typeof u === 'object' ? u.user_id : u;
      return {
        flight_id: flight.flight_id,
        user_id: Number(uId)
      };
    });

    await tx.flightMember.createMany({
      data: memberData
    });

    // 🎯 Sync สิทธิ์ SCORER / GOLFER ลงตาราง User จริงใน DB
    for (const u of user_ids) {
      if (typeof u === 'object' && u.user_id) {
        const targetRole = String(u.role || "GOLFER").toUpperCase();
        await tx.user.update({
          where: { user_id: Number(u.user_id) },
          data: { global_role: targetRole as any }
        });
      }
    }

    return flight;
  });

  return res.status(200).json({
    success: true,
    message: "สร้างก๊วนและบันทึกสมาชิกเรียบร้อยแล้วครับป๋า!",
    data: newFlight
  });
};

// =========================================================================
// 🎯 MODULE 3: อัปเดตข้อมูลก๊วน (ชื่อกลุ่ม / เวลาทีออฟ / หลุมเริ่มต้น)
// 🎯 PUT: api/v1/td/flights/:flight_id
// =========================================================================
export const updateFlightInfo = async (req: Request, res: Response) => {
  const flight_id = req.params.flight_id || req.body.flight_id;
  const { flight_name, t_off_time, start_hole } = req.body;

  if (!flight_id || isNaN(Number(flight_id))) {
    throw createError(400, "กรุณาระบุรหัส flight_id ให้ถูกต้องครับป๋า!");
  }

  const updatedFlight = await prisma.flight.update({
    where: { flight_id: Number(flight_id) },
    data: {
      ...(flight_name && { flight_name }),
      ...(t_off_time && { t_off_time }),
      ...(start_hole && { start_hole: Number(start_hole) }),
    }
  });

  return res.status(200).json({
    success: true,
    message: "อัปเดตข้อมูลก๊วนสำเร็จแล้วครับป๋า!",
    data: updatedFlight
  });
};

// =========================================================================
// 🎯 MODULE 4: แก้ไขเปลี่ยนแปลงสมาชิกในก๊วน (ลบของเก่า ยัดของใหม่)
// 🎯 PUT: api/v1/td/flights/:flight_id/members
// =========================================================================
export const changeFlightMembers = async (req: Request, res: Response) => {
  const flight_id = req.params.flight_id || req.body.flight_id;
  const { user_ids } = req.body;

  if (!flight_id || isNaN(Number(flight_id))) {
    throw createError(400, "ไม่สามารถเปลี่ยนสมาชิกได้: รหัส flight_id ไม่ถูกต้องครับป๋า!");
  }

  if (!user_ids || !Array.isArray(user_ids)) {
    throw createError(400, "รูปแบบข้อมูลสมาชิกไม่ถูกต้องครับป๋า!");
  }

  const flightIdNum = Number(flight_id);

  await prisma.$transaction(async (tx) => {
    // 1. เคลียร์สมาชิกเดิมออกจากก๊วน
    await tx.flightMember.deleteMany({
      where: { flight_id: flightIdNum }
    });

    // 2. เติมสมาชิกก๊วนชุดใหม่ลง DB
    if (user_ids.length > 0) {
      const memberData = user_ids.map((u: any) => {
        const uId = typeof u === 'object' ? u.user_id : u;
        return {
          flight_id: flightIdNum,
          user_id: Number(uId)
        };
      });

      await tx.flightMember.createMany({
        data: memberData
      });

      // 🎯 3. Sync ปรับแต่งสิทธิ์ SCORER / GOLFER ลงตาราง User สดๆ ใน DB
      for (const u of user_ids) {
        if (typeof u === 'object' && u.user_id) {
          const targetRole = String(u.role || "GOLFER").toUpperCase();
          await tx.user.update({
            where: { user_id: Number(u.user_id) },
            data: { global_role: targetRole as any }
          });
        }
      }
    }
  });

  return res.status(200).json({
    success: true,
    message: "ปรับเปลี่ยนสมาชิกก๊วนและสิทธิ์ SCORER เรียบร้อยครับป๋า!"
  });
};

// =========================================================================
// 🎯 MODULE 5: ลบกลุ่มก๊วนออกจากระบบ
// 🎯 DELETE: api/v1/td/flights/:flight_id
// =========================================================================
export const deleteFlight = async (req: Request, res: Response) => {
  const flight_id = req.params.flight_id || req.body.flight_id;

  if (!flight_id || isNaN(Number(flight_id))) {
    throw createError(400, "ไม่สามารถลบก๊วนได้: กรุณาระบุรหัส flight_id ให้ถูกต้องครับป๋า!");
  }

  const flightIdNum = Number(flight_id);

  await prisma.$transaction(async (tx) => {
    // ลบสมาชิกในก๊วนก่อนเพื่อป้องกัน Foreign Key Constraint
    await tx.flightMember.deleteMany({
      where: { flight_id: flightIdNum }
    });

    // ลบก๊วนหลัก
    await tx.flight.delete({
      where: { flight_id: flightIdNum }
    });
  });

  return res.status(200).json({
    success: true,
    message: "ลบกลุ่มก๊วนแข่งขันออกจากระบบเรียบร้อยครับป๋า!"
  });
};