// src/controllers/user/user.tournament.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';

// =========================================================================
// 🎯 MODULE 1: ดึงรายการทัวร์นาเมนต์ทั้งหมดฝั่งนักกอล์ฟ (Get All Tournaments for Golfer)
// 📌 API Path: GET /api/v1/user/tournaments
// =========================================================================
export const getAllTournaments = async (req: Request, res: Response) => {
  const tournamentData = await prisma.tournament.findMany({
    include: {
      course: true // 👈 Include ข้อมูลสนาม เพื่อให้ได้ course_name สดๆ จาก DB
    },
    orderBy: { event_date: 'desc' },
  });

  // 🗺️ Format ข้อมูลเพื่อการันตีว่ามี course_name ส่งออกแน่ๆ
  const formattedData = tournamentData.map((t) => ({
    ...t,
    course_name: t.course?.course_name || "-"
  }));

  return res.status(200).json({
    success: true,
    data: formattedData
  });
};

// =========================================================================
// 🎯 MODULE 2: ดึงข้อมูลกระดานผู้นำสาธารณะ (Get Public Leaderboard & Master Holes)
// 📌 API Path: GET /api/v1/user/tournament/:tournament_id/leaderboard
// =========================================================================
export const getPublicLeaderboard = async (req: Request, res: Response) => {
  const { tournament_id } = req.params;

  if (!tournament_id || isNaN(Number(tournament_id))) {
    throw createError(400, "สายสัญญาณขัดข้อง: รหัสทัวร์นาเมนต์ไม่ถูกต้องครับป๋า!");
  }

  const tournament = await prisma.tournament.findUnique({
    where: { tournament_id: Number(tournament_id) },
    include: {
      course: true // 👈 Include ข้อมูลสนามสำหรับหัว Leaderboard & ScoringPanel
    }
  });

  if (!tournament) {
    throw createError(404, "ไม่พบรายการแข่งขันนี้ในระบบสารบบครับป๋า!");
  }

  const matchStatus = tournament.status?.toLowerCase() || "live";
  const isLive = matchStatus === "live";

  // 💡 ดึง Master Holes 18 หลุมของสนามที่ผูกกับ tournament_id นี้โดยตรง 100%
  const courseHoles = await prisma.hole.findMany({
    where: {
      section: {
        course_id: tournament.course_id
      }
    },
    orderBy: { hole_no: 'asc' },
    take: 18
  });

  const validHoles = courseHoles.length >= 18 ? courseHoles : await prisma.hole.findMany({ take: 18, orderBy: { hole_no: 'asc' } });
  const realTotalCoursePar = validHoles.reduce((sum, h) => sum + h.par, 0) || 70;

  // 🗺️ สร้าง Master Array 18 หลุมส่งกลับไปให้ Store Caching
  const masterHolesList = validHoles.map(h => ({
    hole_no: h.hole_no,
    par: h.par,
    index: h.index || h.hole_no
  }));

  const courseHoleParMap = new Map();
  validHoles.forEach(h => courseHoleParMap.set(h.hole_no, h.par));

  const flights = await prisma.flight.findMany({
    where: { tournament_id: Number(tournament_id) },
    include: {
      scores: {
        include: { hole: true },
        orderBy: { recorded_at: 'desc' }
      },
      members: {
        include: {
          user: {
            omit: { password: true }
          }
        }
      }
    }
  });

  let leaderboardData: any[] = [];

  // 🟢 [Fix issue HD=0]: ตรวจสอบกติกาแบบ Mode ชัดเจน
  const mode = String(tournament.tournament_mode || "NO-HD").toUpperCase();
  const isGrossOnlyMode = mode === "3" || mode.includes("NO-HD") || mode.includes("NO_HD") || mode.includes("GROSS") || mode === "STROKE PLAY";

  flights.forEach(flight => {
    const flightScores = flight.scores || [];

    flight.members.forEach(member => {
      const golfer = member.user;
      let totalGross = 0;
      let totalToPar = 0;
      let outGross = 0;
      let inGross = 0;

      const userRawScores = flightScores.filter(
        (s: any) => Number(s.user_id) === Number(golfer.user_id)
      );

      const uniqueHoleScoresMap = new Map();
      userRawScores.forEach((score: any) => {
        const holeNo = score.hole?.hole_no;
        if (holeNo && !uniqueHoleScoresMap.has(holeNo)) {
          uniqueHoleScoresMap.set(holeNo, score);
        }
      });

      const userScores = Array.from(uniqueHoleScoresMap.values());
      const holesPlayed = userScores.length;

      userScores.forEach((score: any) => {
        const holeNo = score.hole?.hole_no;
        const strokes = Number(score.strokes || 0);
        const par = courseHoleParMap.get(holeNo) || Number(score.hole?.par || 4);

        totalGross += strokes;
        totalToPar += (strokes - par);

        if (holeNo <= 9) outGross += strokes;
        else inGross += strokes;
      });

      let displayToPar = `${totalToPar}`;
      if (holesPlayed === 0) displayToPar = "E";
      else if (totalToPar === 0) displayToPar = "E";
      else if (totalToPar > 0) displayToPar = `+${totalToPar}`;

      // 🟢 [Fix issue HD=0]: ถ้าเป็น Gross Only Mode หรือสถานะเป็น Live บังคับให้ HD = 0
      const rawHdValue = Number(member.calculated_hd || 0);
      const hdValue = (isGrossOnlyMode || isLive) ? 0 : rawHdValue;
      
      // ถ้าเป็น Gross Only Mode ค่า Net จะเท่ากับ Gross เสมอ
      const netValue = isGrossOnlyMode ? totalGross : Number(member.calculated_net || (totalGross - hdValue));

      leaderboardData.push({
        user_id: golfer.user_id,
        fullname: golfer.fullname,
        nickname: golfer.nickname || "-",
        profile_icon: golfer.profile_icon,
        flight_name: flight.flight_name,
        holes_played: holesPlayed,
        out_gross: outGross,
        in_gross: inGross,
        total_gross: totalGross,
        total_to_par: totalToPar,
        display_to_par: displayToPar,
        handicap: hdValue,
        net: netValue
      });
    });
  });

  if (isLive) {
    leaderboardData.sort((a, b) => {
      if (a.holes_played === 0 && b.holes_played > 0) return 1;
      if (b.holes_played === 0 && a.holes_played > 0) return -1;

      if (a.total_to_par !== b.total_to_par) {
        return a.total_to_par - b.total_to_par;
      }

      if (a.holes_played !== b.holes_played) {
        return b.holes_played - a.holes_played;
      }

      return a.user_id - b.user_id;
    });
  } else {
    leaderboardData.sort((a, b) => {
      if (a.net !== b.net) return a.net - b.net;
      if (a.handicap !== b.handicap) return a.handicap - b.handicap;
      
      return a.user_id - b.user_id;
    });
  }

  let currentRank = 1;
  leaderboardData.forEach((player, index) => {
    const compareKey = isLive ? 'total_to_par' : 'net';
    
    if (index > 0 && player.holes_played > 0 && player[compareKey] === leaderboardData[index - 1][compareKey]) {
      player.rank = leaderboardData[index - 1].rank;
    } else {
      player.rank = currentRank;
    }
    currentRank++;
  });

  // 🟢 คำนวณข้อความ Rule ให้ตรงตาม Mode
  let ruleText = tournament.use_age_option ? "Peoria-DMN (Hybrid Age)" : "Peoria-DMN System";
  if (isGrossOnlyMode) {
    ruleText = "Gross Only (NO-HD)";
  }

  console.log(`⛳ [Express Server] Fetched Master Holes for Tournament ID ${tournament_id}: Total Holes = ${masterHolesList.length}`);

  return res.status(200).json({
    success: true,
    tournament_name: tournament.tournament_name,
    course_name: tournament.course?.course_name || "-",
    status: tournament.status,
    event_date: tournament.event_date || null, // 👈 [Fix issue dd]: ส่ง event_date ออกไปด้วยแล้วครับ!
    par: realTotalCoursePar,
    tournament_mode: tournament.tournament_mode || "NO-HD",
    handicap_rule: ruleText,
    peoria_hidden_holes: isGrossOnlyMode 
      ? null 
      : (isLive ? "??, ??, ??, ??, ??, ??" : (tournament.peoria_holes || "ยังไม่มีการเฉลย")),
    holes: masterHolesList,
    leaderboard: leaderboardData
  });
};

// =========================================================================
// 🎯 MODULE 3: ดึงใบคะแนนรายบุคคล (Get Player Scorecard)
// 📌 API Path: GET /api/v1/user/scorecard/:userId
// =========================================================================
export const getPlayerScoreCard = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const tournamentId = req.query.tournament_id;

  if (!userId || isNaN(Number(userId))) {
    throw createError(400, "กรุณาระบุรหัสผู้ใช้งานให้ถูกต้องครับป๋า!");
  }

  // 1. ดึงคะแนนทั้งหมดของผู้เล่น โดยกรอง tournament_id ผ่าน relation ของ flight
  const scores = await prisma.score.findMany({
    where: {
      user_id: Number(userId),
      ...(tournamentId && !isNaN(Number(tournamentId)) 
        ? { flight: { tournament_id: Number(tournamentId) } }
        : {})
    },
    include: { hole: true },
    orderBy: { recorded_at: 'desc' }
  });

  // 2. กรองเอาเฉพาะ Unique Hole No. (เอาค่าล่าสุด)
  const scoreMap = new Map();
  scores.forEach(s => {
    const holeNo = s.hole?.hole_no;
    if (holeNo && !scoreMap.has(holeNo)) {
      scoreMap.set(holeNo, s);
    }
  });

  // 3. ดึง Master Holes ทั้งหมด 18 หลุมของสนาม
  let courseId: number | undefined;
  if (tournamentId && !isNaN(Number(tournamentId))) {
    const t = await prisma.tournament.findUnique({
      where: { tournament_id: Number(tournamentId) },
      select: { course_id: true }
    });
    courseId = t?.course_id;
  }

  const masterHoles = await prisma.hole.findMany({
    where: courseId ? { section: { course_id: courseId } } : undefined,
    orderBy: { hole_no: 'asc' },
    take: 18
  });

  const hole_scores = masterHoles.map(mHole => {
    const userScore = scoreMap.get(mHole.hole_no);
    return {
      hole_id: mHole.hole_id,
      hole_no: mHole.hole_no,
      par: mHole.par,
      index: mHole.index || mHole.hole_no,
      stroke: userScore ? Number(userScore.strokes) : 0,
      strokes: userScore ? Number(userScore.strokes) : 0
    };
  });

  return res.status(200).json({
    success: true,
    hole_scores
  });
};

// =========================================================================
// 🎯 MODULE 4: ดึงรายชื่อนักกอล์ฟ/ผู้ใช้งานทั้งหมดในระบบ (Get All Users)
// 📌 API Path: GET /api/v1/user/all
// =========================================================================
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      user_id: true,
      username: true,
      fullname: true,
      nickname: true,
      global_role: true
    },
    orderBy: { user_id: 'asc' }
  });

  return res.status(200).json({
    success: true,
    data: users
  });
};