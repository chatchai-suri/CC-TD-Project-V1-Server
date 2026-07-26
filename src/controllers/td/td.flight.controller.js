import { prisma } from "../../config/prisma.js";
import { createError } from "../../utils/createError.js";
// 🎯 POST: api/v1/td/tournaments/:tournament_id/flights (สร้างก๊วนใหม่พร้อมสมาชิก)
export const setupFlightWithMembers = async (req, res) => {
    const tournament_id = req.params.tournament_id || req.body.tournament_id;
    const { flight_name, t_off_time, user_ids } = req.body;
    if (!tournament_id || !flight_name) {
        throw createError(400, "ข้อมูลไม่ครบถ้วน: กรุณาระบุระเบียบ tournament_id และ flight_name ด้วยครับป๋า!");
    }
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        throw createError(400, "จัดก๊วนล้มเหลว: ก๊วนกอล์ฟจำเป็นต้องมีรายชื่อนักกอล์ฟอย่างน้อย 1 คนครับ!");
    }
    const result = await prisma.$transaction(async (tx) => {
        const newFlight = await tx.flight.create({
            data: {
                tournament_id: Number(tournament_id),
                flight_name,
                t_off_time: t_off_time || null,
            },
        });
        // 💡 ปรับให้ตรงกับ Schema จริง: ไม่ยัดฟิลด์ role ลงตาราง flight_members
        const memberData = user_ids.map((item) => {
            const isObj = typeof item === 'object' && item !== null;
            return {
                flight_id: newFlight.flight_id,
                user_id: Number(isObj ? item.user_id : item),
                handicap_claim: isObj && item.handicap_claim !== undefined ? Number(item.handicap_claim) : 0,
            };
        });
        await tx.flightMember.createMany({
            data: memberData,
        });
        return await tx.flight.findUnique({
            where: { flight_id: newFlight.flight_id },
            include: {
                members: {
                    include: {
                        user: { omit: { password: true } }
                    }
                }
            }
        });
    });
    res.status(201).json({
        success: true,
        message: `เนรมิตกลุ่มก๊วน "${flight_name}" พร้อมบรรจุรายชื่อนักกอล์ฟสำเร็จครับ! ⛳`,
        data: result,
    });
};
// 🎯 PUT: api/v1/td/flights/:flight_id (แก้ไขชื่อก๊วน/เวลา)
export const updateFlightInfo = async (req, res) => {
    const flight_id = req.params.flight_id || req.body.flight_id;
    const { flight_name, t_off_time } = req.body;
    if (!flight_id) {
        throw createError(400, "ไม่สามารถแก้ไขได้: กรุณาระบุรหัสระเบียบ flight_id ด้วยครับป๋า!");
    }
    const updatedFlight = await prisma.flight.update({
        where: { flight_id: Number(flight_id) },
        data: {
            flight_name: flight_name || undefined,
            t_off_time: t_off_time !== undefined ? t_off_time : undefined
        }
    });
    res.status(200).json({
        success: true,
        message: `ปรับแต่งข้อมูลกลุ่มก๊วนเรียบร้อยครับป๋า! ⛳`,
        data: updatedFlight
    });
};
// 🎯 PUT: api/v1/td/flights/:flight_id/members (ล้างไพ่จัดสมาชิกก๊วนใหม่)
// 🎯 PUT: api/v1/td/flights/:flight_id/members
export const changeFlightMembers = async (req, res) => {
    const flight_id = req.params.flight_id || req.body.flight_id;
    const { user_ids } = req.body;
    if (!flight_id || isNaN(Number(flight_id))) {
        throw createError(400, "สลับสมาชิกล้มเหลว: กรุณาระบุ flight_id เป้าหมายด้วยครับป๋า!");
    }
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        throw createError(400, "สลับสมาชิกล้มเหลว: ก๊วนกอล์ฟจำเป็นต้องมีรายชื่อสมาชิกอย่างน้อย 1 คนครับ!");
    }
    const result = await prisma.$transaction(async (tx) => {
        // 🛡️ 1. ลบ Score เก่าของก๊วนนี้ออกก่อนป้องกัน Foreign Key Crash
        await tx.score.deleteMany({
            where: { flight_id: Number(flight_id) }
        });
        // 🛡️ 2. ล้างรายชื่อสมาชิกเดิมในก๊วนนี้
        await tx.flightMember.deleteMany({
            where: { flight_id: Number(flight_id) }
        });
        // 🛡️ 3. บันทึกสมาชิกใหม่
        const newMembers = user_ids.map((item) => {
            const isObj = typeof item === 'object' && item !== null;
            return {
                flight_id: Number(flight_id),
                user_id: Number(isObj ? item.user_id : item),
                handicap_claim: isObj && item.handicap_claim !== undefined ? Number(item.handicap_claim) : 0
            };
        });
        await tx.flightMember.createMany({
            data: newMembers
        });
        return await tx.flight.findUnique({
            where: { flight_id: Number(flight_id) },
            include: {
                members: {
                    include: {
                        user: { omit: { password: true } }
                    }
                }
            }
        });
    });
    res.status(200).json({
        success: true,
        message: "ล้างไพ่จัดสรรนักกอล์ฟลงก๊วนตัวจริงชุดใหม่เรียบร้อยครับป๋าปู! 🏌️‍♂️🔥",
        data: result
    });
};
// 🎯 GET: api/v1/td/tournaments/:tournament_id/flights 
export const getFlightSetup = async (req, res) => {
    const tournament_id = req.params.tournament_id || req.body.tournament_id;
    const flights = await prisma.flight.findMany({
        where: { tournament_id: Number(tournament_id) },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            user_id: true,
                            username: true,
                            fullname: true,
                            global_role: true,
                            // 🎯 ดึงแต้มสดที่เคยเซฟไว้ในตาราง scores พ่วงแนบกลับไปด้วย!
                            scores: {
                                where: { flight: { tournament_id: Number(tournament_id) } },
                                include: { hole: true }
                            }
                        }
                    }
                }
            }
        }
    });
    return res.status(200).json({
        success: true,
        data: flights
    });
};
// 🎯 DELETE: api/v1/td/flights/:flight_id (ลบก๊วนออกจากระบบ)
export const deleteFlight = async (req, res) => {
    const flight_id = req.params.flight_id || req.body.flight_id;
    if (!flight_id || isNaN(Number(flight_id))) {
        throw createError(400, "ไม่สามารถลบก๊วนได้: รหัส flight_id ไม่ถูกต้องครับป๋า!");
    }
    await prisma.$transaction(async (tx) => {
        const flight = await tx.flight.findUnique({
            where: { flight_id: Number(flight_id) }
        });
        if (!flight)
            throw createError(404, "ไม่พบก๊วนแข่งขันนี้ในระบบคลังครับป๋า!");
        await tx.flightMember.deleteMany({
            where: { flight_id: Number(flight_id) }
        });
        await tx.flight.delete({
            where: { flight_id: Number(flight_id) }
        });
    });
    return res.status(200).json({
        success: true,
        message: `🗑️ ทำลายก๊วนหมายเลข [${flight_id}] ออกจากสารบบเรียบร้อยครับป๋าปู!`
    });
};
//# sourceMappingURL=td.flight.controller.js.map