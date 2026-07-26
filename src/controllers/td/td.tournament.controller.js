import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';
// =========================================================================
// 🎯 MODULE 1: ลงทะเบียนสร้างทัวร์นาเมนต์ใหม่
// =========================================================================
export const registerTournament = async (req, res) => {
    const { tournament_name, course_id, event_date, tournament_mode, use_age_option } = req.body;
    if (!tournament_name || !course_id) {
        throw createError(400, "ข้อมูลไม่ครบถ้วน: กรุณาระบุชื่อทัวร์นาเมนต์และสนามแข่งขันด้วยครับป๋า!");
    }
    const newTournament = await prisma.tournament.create({
        data: {
            tournament_name,
            course_id: Number(course_id),
            event_date: event_date ? new Date(event_date) : new Date(),
            tournament_mode: tournament_mode || "Stroke Play",
            use_age_option: use_age_option !== undefined ? Boolean(use_age_option) : true,
            status: "setup"
        }
    });
    return res.status(200).json({
        success: true,
        message: "สลักสร้างรายการแข่งขันใหม่เรียบร้อยแล้วครับป๋า!",
        data: newTournament
    });
};
// =========================================================================
// 🎯 MODULE 2: ดึงกระดานผู้นำฝั่งผู้จัดการแข่งขัน (TD Leaderboard View)
// =========================================================================
export const getTournamentLeaderboard = async (req, res) => {
    const tournament_id = req.params.tournament_id || req.body.tournament_id;
    if (!tournament_id || isNaN(Number(tournament_id))) {
        throw createError(400, "กรุณาระบุรหัส tournament_id ให้ถูกต้องครับ!");
    }
    const tournament = await prisma.tournament.findUnique({
        where: { tournament_id: Number(tournament_id) }
    });
    if (!tournament) {
        throw createError(404, "ไม่พบข้อมูลรายการแข่งขันนี้ในคลังระบบครับ!");
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
        }
    });
    return res.status(200).json({
        success: true,
        tournament,
        flights
    });
};
// =========================================================================
// 🎯 MODULE 3: สวิตช์ปิดแมตช์และประมวลผลแต้มต่อ Peoria-DMN
// =========================================================================
// 🎯 PUT: api/v1/td/tournaments/:tournament_id/close
export const closeTournamentByPeoriaDMN = async (req, res) => {
    const tournament_id = req.params.tournament_id || req.body.tournament_id;
    const { peoria_holes } = req.body;
    if (!tournament_id || isNaN(Number(tournament_id))) {
        throw createError(400, "ไม่สามารถปิดแมตช์ได้: กรุณาระบุรหัส tournament_id ให้ถูกต้องครับป๋า!");
    }
    if (!peoria_holes || !Array.isArray(peoria_holes) || peoria_holes.length !== 12) {
        throw createError(400, "กติกา Peoria-DMN ล้มเหลว: ต้องระบุหลุมลับ (Secret Holes) ให้ครบถ้วน 12 หลุมครับ!");
    }
    const tournamentIdNum = Number(tournament_id);
    const tournament = await prisma.tournament.findUnique({
        where: { tournament_id: tournamentIdNum }
    });
    if (!tournament) {
        throw createError(404, "ไม่พบข้อมูลรายการแข่งขันนี้ในระบบคลังครับป๋า!");
    }
    // 💡 จุดแก้ระดับรากฐาน: ดึงหลุมเฉพาะ 18 หลุมแรกที่เรียงตาม hole_no 1-18 สลักค่า Par สนามจริง
    const targetHoles = await prisma.hole.findMany({
        where: {
            section: {
                course_id: tournament.course_id
            }
        },
        orderBy: { hole_no: 'asc' },
        take: 18
    });
    const valid18Holes = targetHoles.length >= 18 ? targetHoles : await prisma.hole.findMany({ take: 18, orderBy: { hole_no: 'asc' } });
    let courseTotalPar = 0;
    const secretHoleNos = new Set(peoria_holes.map(Number));
    valid18Holes.forEach(h => {
        courseTotalPar += h.par;
    });
    if (courseTotalPar === 0 || courseTotalPar > 100)
        courseTotalPar = 70;
    await prisma.$transaction(async (tx) => {
        await tx.tournament.update({
            where: { tournament_id: tournamentIdNum },
            data: {
                status: "final",
                peoria_holes: peoria_holes.join(",")
            }
        });
        const flights = await tx.flight.findMany({
            where: { tournament_id: tournamentIdNum },
            include: {
                members: true
            }
        });
        for (const flight of flights) {
            for (const member of flight.members) {
                // ดึงคะแนนตรง 18 หลุมล่าสุดของนักกอล์ฟ
                const userScores = await tx.score.findMany({
                    where: {
                        user_id: member.user_id,
                        flight_id: flight.flight_id
                    },
                    include: { hole: true },
                    orderBy: { hole: { hole_no: 'asc' } },
                    take: 18
                });
                let totalGross = 0;
                let adjustedSecretGross = 0;
                userScores.forEach(score => {
                    totalGross += score.strokes;
                    if (secretHoleNos.has(score.hole.hole_no)) {
                        const holePar = score.hole.par || 4;
                        const maxCap = holePar * 2;
                        const cappedStroke = Math.min(score.strokes, maxCap);
                        adjustedSecretGross += cappedStroke;
                    }
                });
                /**
                 * 📐 PEORIA-DMN HANDICAP FORMULA
                 * HD = [ (Adjusted Secret Gross x 1.5) - Total Course Par ] x 0.8
                 */
                let rawHd = ((adjustedSecretGross * 1.5) - courseTotalPar) * 0.8;
                if (rawHd < 0)
                    rawHd = 0;
                const finalHd = Math.round(rawHd * 10) / 10;
                const finalNet = Math.round((totalGross - finalHd) * 10) / 10;
                await tx.flightMember.update({
                    where: {
                        flight_id_user_id: {
                            flight_id: member.flight_id,
                            user_id: member.user_id
                        }
                    },
                    data: {
                        calculated_hd: finalHd,
                        calculated_net: finalNet
                    }
                });
            }
        }
    });
    return res.status(200).json({
        success: true,
        message: "🏆 คำนวณแต้มต่อ Peoria-DMN (สูตร 1.5) และสลักอันดับลง DB สำเร็จเรียบร้อยครับป๋าปู!"
    });
};
// =========================================================================
// 🎯 MODULE 4: สลับแมตช์กลับเป็น LIVE
// =========================================================================
export const reopenTournamentToLive = async (req, res) => {
    const tournament_id = req.params.tournament_id || req.body.tournament_id;
    if (!tournament_id || isNaN(Number(tournament_id))) {
        throw createError(400, "ไม่สามารถเปิดแมตช์ได้: กรุณาระบุรหัส tournament_id ด้วยครับป๋า!");
    }
    const tournamentIdNum = Number(tournament_id);
    await prisma.$transaction(async (tx) => {
        await tx.tournament.update({
            where: { tournament_id: tournamentIdNum },
            data: { status: "live" }
        });
        const flights = await tx.flight.findMany({
            where: { tournament_id: tournamentIdNum },
            select: { flight_id: true }
        });
        const flightIds = flights.map(f => f.flight_id);
        await tx.flightMember.updateMany({
            where: { flight_id: { in: flightIds } },
            data: {
                calculated_hd: 0,
                calculated_net: 0
            }
        });
    });
    return res.status(200).json({
        success: true,
        message: "⚡ ปลดล็อกทัวร์นาเมนต์กลับสู่สถานะ LIVE เรียบร้อยครับป๋าปู!"
    });
};
//# sourceMappingURL=td.tournament.controller.js.map