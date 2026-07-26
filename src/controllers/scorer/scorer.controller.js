import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';
// 🎯 POST: api/v1/scorer/scores (ลอจิกการบันทึกสโตรกคะแนนดิบรายหลุม/ทั้งก๊วน)
export const recordScores = async (req, res) => {
    const { flight_id, scores } = req.body;
    if (!flight_id) {
        throw createError(400, "ไม่สามารถบันทึกแต้มได้: กรุณาระบุ flight_id ด้วยครับป๋าปู!");
    }
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
        throw createError(400, "ไม่สามารถบันทึกแต้มได้: ไม่พบรายการสโตรกคะแนนในพัสดุขาเข้าครับ!");
    }
    const allHoles = await prisma.hole.findMany();
    const holeMap = new Map();
    allHoles.forEach((h) => holeMap.set(h.hole_no, h.hole_id));
    const savePromises = scores.map(async (item) => {
        const { user_id, hole_no, hole_id, stroke, strokes } = item;
        const targetStroke = stroke !== undefined ? stroke : strokes;
        const targetHoleId = hole_id ? Number(hole_id) : holeMap.get(Number(hole_no));
        if (!targetHoleId)
            return;
        // 🟢 กรณีที่ 1: หน้าบ้านสั่งล้างแต้ม (stroke === null) ให้ลบออกจาก DB
        if (targetStroke === null || targetStroke === undefined) {
            return prisma.score.deleteMany({
                where: {
                    flight_id: Number(flight_id),
                    user_id: Number(user_id),
                    hole_id: Number(targetHoleId)
                }
            });
        }
        // 🟢 กรณีที่ 2: มีแต้มคีย์เข้ามา ให้สั่ง UPSERT บันทึกลง DB
        const existing = await prisma.score.findFirst({
            where: {
                flight_id: Number(flight_id),
                user_id: Number(user_id),
                hole_id: Number(targetHoleId)
            }
        });
        if (existing) {
            return prisma.score.update({
                where: { score_id: existing.score_id },
                data: { strokes: Number(targetStroke) }
            });
        }
        else {
            return prisma.score.create({
                data: {
                    flight_id: Number(flight_id),
                    user_id: Number(user_id),
                    hole_id: Number(targetHoleId),
                    strokes: Number(targetStroke)
                }
            });
        }
    });
    await Promise.all(savePromises);
    res.status(200).json({
        success: true,
        message: "สลักสโตรกคะแนนสดลงคลัง MySQL เรียบร้อยแล้วครับป๋าปู! ⛳💾"
    });
};
// 🎯 GET: api/v1/scorer/tournaments/:tournament_id/users/:user_id/summary (สรุปผลคะแนนรวมรายบุคคล)
export const getGolferSummary = async (req, res) => {
    const { tournament_id, user_id } = req.params;
    if (!tournament_id || !user_id) {
        throw createError(400, "ระเบียบข้อมูลไม่ครบถ้วน: กรุณาระบุ tournament_id และ user_id ด้วยครับป๋า!");
    }
    const scores = await prisma.score.findMany({
        where: {
            user_id: Number(user_id),
            flight: { tournament_id: Number(tournament_id) }
        },
        include: {
            hole: true
        }
    });
    if (scores.length === 0) {
        return res.status(200).json({
            success: true,
            message: "นักกอล์ฟท่านนี้ยังไม่มีการบันทึกคะแนนดิบลงสนามครับป๋า!",
            data: { holes_played: 0, total_gross: 0, total_to_par: 0, display: "E" }
        });
    }
    let totalGross = 0;
    let totalToPar = 0;
    const holesPlayed = scores.length;
    scores.forEach((s) => {
        totalGross += s.strokes;
        totalToPar += (s.strokes - s.hole.par);
    });
    let toParDisplay = `${totalToPar}`;
    if (totalToPar === 0)
        toParDisplay = "E";
    if (totalToPar > 0)
        toParDisplay = `+${totalToPar}`;
    res.status(200).json({
        success: true,
        data: {
            holes_played: holesPlayed,
            total_gross: totalGross,
            total_to_par: totalToPar,
            display: toParDisplay
        }
    });
};
// 🎯 GET: api/v1/scorer/my-flight (ค้นหาก๊วนประจำตัวผู้เล่น/Scorer ที่ล็อกอินอยู่)
export const getMyFlight = async (req, res) => {
    const userId = req.user?.user_id || req.query.user_id;
    if (!userId || isNaN(Number(userId))) {
        throw createError(400, "ไม่สามารถดึงข้อมูลก๊วนได้: ไม่พบรหัส user_id ครับป๋า!");
    }
    const memberRecord = await prisma.flightMember.findFirst({
        where: { user_id: Number(userId) },
        orderBy: { flight_member_id: 'desc' },
        include: {
            flight: {
                include: {
                    tournament: true,
                    members: {
                        include: {
                            user: { select: { user_id: true, username: true, fullname: true, nickname: true, global_role: true } }
                        }
                    }
                }
            }
        }
    });
    if (!memberRecord) {
        throw createError(404, "นักกอล์ฟท่านนี้ยังไม่ได้จัดลงก๊วนใดๆ ในสนามครับป๋า!");
    }
    const holes = await prisma.hole.findMany({
        where: { section: { course_id: memberRecord.flight.tournament.course_id } },
        orderBy: { hole_no: 'asc' }
    });
    const scores = await prisma.score.findMany({
        where: { flight_id: memberRecord.flight_id }
    });
    res.status(200).json({
        success: true,
        data: {
            flight: memberRecord.flight,
            holes,
            scores
        }
    });
};
//# sourceMappingURL=scorer.controller.js.map