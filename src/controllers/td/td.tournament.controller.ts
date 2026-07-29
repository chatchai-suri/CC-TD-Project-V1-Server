import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';

// =========================================================================
// 🎯 MODULE 1: ลงทะเบียนสร้างทัวร์นาเมนต์ใหม่ (Create)
// =========================================================================
export const registerTournament = async (req: Request, res: Response) => {
  const { 
    tournament_name, 
    course_id, 
    event_date, 
    tournament_mode, 
    use_age_option 
  } = req.body;

  if (!tournament_name || !course_id) {
    throw createError(400, "ข้อมูลไม่ครบถ้วน: กรุณาระบุชื่อทัวร์นาเมนต์และสนามแข่งขันด้วยครับป๋า!");
  }

  const newTournament = await prisma.tournament.create({
    data: {
      tournament_name,
      course_id: Number(course_id),
      event_date: event_date ? new Date(event_date) : new Date(),
      tournament_mode: tournament_mode || "NO-HD",
      use_age_option: use_age_option !== undefined ? Boolean(use_age_option) : false,
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
// 🎯 MODULE 2: แก้ไขข้อมูลทัวร์นาเมนต์ (Update)
// =========================================================================
export const updateTournament = async (req: Request, res: Response) => {
  const tournament_id = req.params.tournament_id || req.body.tournament_id;
  const { 
    tournament_name, 
    course_id, 
    event_date, 
    tournament_mode, 
    use_age_option 
  } = req.body;

  if (!tournament_id || isNaN(Number(tournament_id))) {
    throw createError(400, "กรุณาระบุรหัส tournament_id ให้ถูกต้องครับ!");
  }

  const tournamentIdNum = Number(tournament_id);

  const existingTournament = await prisma.tournament.findUnique({
    where: { tournament_id: tournamentIdNum }
  });

  if (!existingTournament) {
    throw createError(404, "ไม่พบข้อมูลรายการแข่งขันที่ต้องการแก้ไขครับป๋า!");
  }

  const updatedTournament = await prisma.tournament.update({
    where: { tournament_id: tournamentIdNum },
    data: {
      ...(tournament_name && { tournament_name }),
      ...(course_id && { course_id: Number(course_id) }),
      ...(event_date && { event_date: new Date(event_date) }),
      ...(tournament_mode && { tournament_mode }),
      ...(use_age_option !== undefined && { use_age_option: Boolean(use_age_option) })
    }
  });

  return res.status(200).json({
    success: true,
    message: "อัปเดตข้อมูลทัวร์นาเมนต์เรียบร้อยแล้วครับป๋า!",
    data: updatedTournament
  });
};

// =========================================================================
// 🎯 MODULE 3: ลบทัวร์นาเมนต์ (Delete)
// =========================================================================
export const deleteTournament = async (req: Request, res: Response) => {
  const tournament_id = req.params.tournament_id || req.body.tournament_id;

  if (!tournament_id || isNaN(Number(tournament_id))) {
    throw createError(400, "กรุณาระบุรหัส tournament_id ให้ถูกต้องครับ!");
  }

  const tournamentIdNum = Number(tournament_id);

  const existingTournament = await prisma.tournament.findUnique({
    where: { tournament_id: tournamentIdNum }
  });

  if (!existingTournament) {
    throw createError(404, "ไม่พบรายการแข่งขันที่ต้องการลบในระบบครับป๋า!");
  }

  await prisma.$transaction(async (tx) => {
    const flights = await tx.flight.findMany({
      where: { tournament_id: tournamentIdNum },
      select: { flight_id: true }
    });

    const flightIds = flights.map(f => f.flight_id);

    if (flightIds.length > 0) {
      // 🛡️ ป้องกัน Foreign Key Constraint ด้วยการลบ Score ล่วงหน้า
      await tx.score.deleteMany({ where: { flight_id: { in: flightIds } } });
      await tx.flightMember.deleteMany({ where: { flight_id: { in: flightIds } } });
      await tx.flight.deleteMany({ where: { tournament_id: tournamentIdNum } });
    }

    await tx.tournament.delete({
      where: { tournament_id: tournamentIdNum }
    });
  });

  return res.status(200).json({
    success: true,
    message: "ลบรายการแข่งขันและข้อมูลการจัดกลุ่มเรียบร้อยแล้วครับป๋า!"
  });
};

// =========================================================================
// 🎯 MODULE 4: ดึงกระดานผู้นำฝั่งผู้จัดการแข่งขัน (TD Leaderboard View)
// =========================================================================
export const getTournamentLeaderboard = async (req: Request, res: Response) => {
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
// 🎯 MODULE 5: ปิดแมตช์คำนวณผล (รองรับทั้ง PEORIA และ NO-HD / GROSS ONLY)
// =========================================================================
export const closeTournament = async (req: Request, res: Response) => {
  const tournament_id = req.params.tournament_id || req.body.tournament_id;
  const { peoria_holes } = req.body;

  if (!tournament_id || isNaN(Number(tournament_id))) {
    throw createError(400, "ไม่สามารถปิดแมตช์ได้: กรุณาระบุรหัส tournament_id ให้ถูกต้องครับป๋า!");
  }

  const tournamentIdNum = Number(tournament_id);

  const tournament = await prisma.tournament.findUnique({
    where: { tournament_id: tournamentIdNum }
  });

  if (!tournament) {
    throw createError(404, "ไม่พบข้อมูลรายการแข่งขันนี้ในระบบคลังครับป๋า!");
  }

  const mode = (tournament.tournament_mode || "NO-HD").toUpperCase();
  const isNoHd = mode.includes("NO-HD") || mode.includes("NO_HD") || mode.includes("GROSS") || mode === "NONE" || mode === "STROKE PLAY";

  if (!isNoHd && (!peoria_holes || !Array.isArray(peoria_holes) || peoria_holes.length !== 12)) {
    throw createError(400, "กติกา Peoria ล้มเหลว: ต้องระบุหลุมลับ (Secret Holes) ให้ครบถ้วน 12 หลุมครับ!");
  }

  // ดึง Master Holes 18 หลุมตามสนาม
  const targetHoles = await prisma.hole.findMany({
    where: { section: { course_id: tournament.course_id } },
    orderBy: { hole_no: 'asc' },
    take: 18
  });

  const valid18Holes = targetHoles.length >= 18 
    ? targetHoles 
    : await prisma.hole.findMany({ take: 18, orderBy: { hole_no: 'asc' } });

  let courseTotalPar = valid18Holes.reduce((sum, h) => sum + h.par, 0);
  if (courseTotalPar === 0 || courseTotalPar > 100) courseTotalPar = 72;

  const secretHoleNos = new Set(peoria_holes ? peoria_holes.map(Number) : []);

  await prisma.$transaction(async (tx) => {
    await tx.tournament.update({
      where: { tournament_id: tournamentIdNum },
      data: {
        status: "final",
        peoria_holes: peoria_holes ? peoria_holes.join(",") : null
      }
    });

    const flights = await tx.flight.findMany({
      where: { tournament_id: tournamentIdNum },
      include: { members: true }
    });

    const allFlightIds = flights.map(f => f.flight_id);
    
    // ดึง Score เฉพาะที่กรอกแล้วจริง (strokes > 0)
    const allScores = await tx.score.findMany({
      where: { 
        flight_id: { in: allFlightIds },
        strokes: { gt: 0 }
      },
      include: { hole: true },
      orderBy: { recorded_at: 'desc' }
    });

    // 🛡️ DEDUPLICATION: เอาเฉพาะ Score ล่าสุดของแต่ละหลุม
    const userUniqueScoresMap = new Map<string, Map<number, any>>();
    
    allScores.forEach(score => {
      const key = `${score.flight_id}-${score.user_id}`;
      if (!userUniqueScoresMap.has(key)) {
        userUniqueScoresMap.set(key, new Map<number, any>());
      }
      
      const holeNo = score.hole?.hole_no;
      const userHoleMap = userUniqueScoresMap.get(key)!;
      
      if (holeNo && !userHoleMap.has(holeNo)) {
        userHoleMap.set(holeNo, score);
      }
    });

    for (const flight of flights) {
      for (const member of flight.members) {
        const key = `${flight.flight_id}-${member.user_id}`;
        const userHoleMap = userUniqueScoresMap.get(key);
        const userScores = userHoleMap ? Array.from(userHoleMap.values()) : [];

        let totalGross = 0;
        let adjustedSecretGross = 0;

        userScores.forEach(score => {
          const strokes = Number(score.strokes || 0);
          const holeNo = score.hole?.hole_no;
          const holePar = score.hole?.par || 4;

          totalGross += strokes;
          
          if (holeNo && secretHoleNos.has(holeNo)) {
            const maxCap = holePar * 2;
            const cappedStroke = Math.min(strokes, maxCap);
            adjustedSecretGross += cappedStroke;
          }
        });

        let finalHd: number | null = 0;
        let finalNet: number | null = totalGross;

        if (!isNoHd) {
          let rawHd = ((adjustedSecretGross * 1.5) - courseTotalPar) * 0.8;
          if (rawHd < 0) rawHd = 0;
          finalHd = Math.round(rawHd * 10) / 10;
          finalNet = Math.round((totalGross - finalHd) * 10) / 10;
        }

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
  }, {
    timeout: 15000
  });

  return res.status(200).json({
    success: true,
    message: isNoHd 
      ? "🏆 ปิดแมตช์ประมวลผลกติกา Gross Only (NO-HD) เรียบร้อยครับป๋า!"
      : "🏆 คำนวณแต้มต่อ Peoria-DMN เรียบร้อยครับป๋า!"
  });
};

export const closeTournamentByPeoriaDMN = closeTournament;

// =========================================================================
// 🎯 MODULE 6: สลับแมตช์กลับเป็น LIVE
// =========================================================================
export const reopenTournamentToLive = async (req: Request, res: Response) => {
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

    if (flightIds.length > 0) {
      await tx.flightMember.updateMany({
        where: { flight_id: { in: flightIds } },
        data: {
          calculated_hd: null,
          calculated_net: null
        }
      });
    }
  });

  return res.status(200).json({
    success: true,
    message: "⚡ ปลดล็อกทัวร์นาเมนต์กลับสู่สถานะ LIVE เรียบร้อยครับป๋าปู!"
  });
};

// =========================================================================
// 🎯 MODULE 7: สลับสถานะแมตช์ทัวร์นาเมนต์ (SETUP ↔️ LIVE ↔️ FINAL)
// =========================================================================
export const updateTournamentStatus = async (req: Request, res: Response) => {
  const tournament_id = req.params.tournament_id || req.body.tournament_id;
  const { status } = req.body;

  if (!tournament_id || isNaN(Number(tournament_id))) {
    throw createError(400, "ไม่สามารถเปลี่ยนสถานะได้: กรุณาระบุรหัส tournament_id ให้ถูกต้องครับป๋า!");
  }

  const validStatuses = ["setup", "live", "final"];
  const normalizedStatus = String(status || "").toLowerCase();

  if (!validStatuses.includes(normalizedStatus)) {
    throw createError(400, "สถานะแมตช์ไม่ถูกต้อง: ต้องเป็น setup, live หรือ final เท่านั้นครับ!");
  }

  const tournamentIdNum = Number(tournament_id);

  const updatedTournament = await prisma.tournament.update({
    where: { tournament_id: tournamentIdNum },
    data: { status: normalizedStatus }
  });

  return res.status(200).json({
    success: true,
    message: `สลับสถานะแมตช์เป็น ${normalizedStatus.toUpperCase()} เรียบร้อยแล้วครับป๋า!`,
    data: updatedTournament
  });
};