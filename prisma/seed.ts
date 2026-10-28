// Golf-TD-Server/prisma/seed.ts
declare const process: any; // 👈 สยบเส้นแดง process ใน TS Linter ทันทีตามมาตรฐาน
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hashPassword } from '../src/utils/password.util.js'; // 👈 นำเข้าฟังก์ชันแฮช Argon2

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'golf_root_password',
  database: process.env.DB_NAME || 'tournament_director_db',
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 เริ่มต้นปฏิบัติการ Re-Seed (24 นักกอล์ฟ + 7 สนาม + คะแนนทดสอบครบ 18 หลุม)...');

  // 1. ล้างตารางเรียงตามระดับ Foreign Key Constraint
  await prisma.score.deleteMany({});
  await prisma.flightMember.deleteMany({});
  await prisma.flight.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.hole.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.course.deleteMany({});

  // 🔒 2. สร้างค่า Hash ของรหัสผ่านเริ่มต้น "123456" ด้วย Argon2 (คำนวณรอบเดียวเพื่อประสิทธิภาพ)
  const plainPassword = "123456";
  const defaultHashedPassword = await hashPassword(plainPassword);
  const defaultProfileIcon = "https://api.dicebear.com/7.x/adventurer/svg?seed=porn";

  console.log('👥 กำลังสร้างบัญชีผู้ใช้งาน 24 ท่าน (พร้อมรหัสผ่านแฮช Argon2)...');

  // 👑 บัญชีหลักป๋าปู (TD) - ID: 1
  const uPapoo = await prisma.user.create({
    data: {
      fullname: "Chatchai Suriyawan",
      nickname: "Papoo",
      username: "papoo",
      password: defaultHashedPassword,
      global_role: "TD",
      profile_icon: defaultProfileIcon
    }
  });

  // 📝 บัญชี SCORER 4 ท่านประจำกลุ่ม - ID: 2 - 5
  const uNarapati = await prisma.user.create({
    data: { fullname: "Narapati", nickname: "Narapati", username: "narapati", password: defaultHashedPassword, global_role: "SCORER", profile_icon: defaultProfileIcon }
  });
  const uNoppadon = await prisma.user.create({
    data: { fullname: "Noppadon", nickname: "Noppadon", username: "noppadon", password: defaultHashedPassword, global_role: "SCORER", profile_icon: defaultProfileIcon }
  });
  const uVasun = await prisma.user.create({
    data: { fullname: "Vasun", nickname: "Vasun", username: "vasun", password: defaultHashedPassword, global_role: "SCORER", profile_icon: defaultProfileIcon }
  });
  const uVittavas = await prisma.user.create({
    data: { fullname: "Vittavas", nickname: "Vittavas", username: "vittavas", password: defaultHashedPassword, global_role: "SCORER", profile_icon: defaultProfileIcon }
  });

  // 🏌️‍♂️ บัญชี GOLFER 19 ท่าน (ID: 6 - 24)
  const otherPlayers = [
    { fullname: "Morihiro", nickname: "Morihiro", username: "morihiro" },     // ID: 6
    { fullname: "Boonrawd", nickname: "Boonrawd", username: "boonrawd" },     // ID: 7
    { fullname: "Osada", nickname: "Osada", username: "osada" },               // ID: 8
    { fullname: "Songkiat", nickname: "Songkiat", username: "songkiat" },     // ID: 9
    { fullname: "Taito", nickname: "Taito", username: "taito" },               // ID: 10
    { fullname: "Konuma", nickname: "Konuma", username: "konuma" },           // ID: 11
    { fullname: "Nipon", nickname: "Nipon", username: "nipon" },               // ID: 12
    { fullname: "Ariyama", nickname: "Ariyama", username: "ariyama" },         // ID: 13
    { fullname: "Prasert", nickname: "Prasert", username: "prasert" },         // ID: 14
    { fullname: "Miokawa", nickname: "Miokawa", username: "miokawa" },         // ID: 15
    { fullname: "Chiradool", nickname: "Chiradool", username: "chiradool" },   // ID: 16
    { fullname: "Furui", nickname: "Furui", username: "furui" },               // ID: 17
    { fullname: "Yuthavee", nickname: "Yuthavee", username: "yuthavee" },     // ID: 18
    { fullname: "Yamamoto", nickname: "Yamamoto", username: "yamamoto" },     // ID: 19
    { fullname: "Sarun", nickname: "Sarun", username: "sarun" },               // ID: 20
    { fullname: "Jakrapard", nickname: "Jakrapard", username: "jakrapard" },   // ID: 21
    { fullname: "Chatchai", nickname: "Chatchai", username: "chatchai" },     // ID: 22
    { fullname: "Kochapan", nickname: "pla", username: "kochapan" },           // ID: 23 (nickname: pla)
    { fullname: "Jun", nickname: "jun", username: "jun" }                      // ID: 24 (nickname: jun)
  ];

  const createdGolfers: any[] = [];
  for (const p of otherPlayers) {
    const user = await prisma.user.create({
      data: {
        fullname: p.fullname,
        nickname: p.nickname,
        username: p.username,
        password: defaultHashedPassword,
        global_role: "GOLFER",
        profile_icon: defaultProfileIcon
      }
    });
    createdGolfers.push(user);
  }

  // 3. เนรมิต Master Courses 7 สนามแข่งจริง
  console.log('⛳ กำลังลงทะเบียนสนามกอล์ฟทั้ง 7 สนาม...');

  // 🏛️ สนามที่ 1: Amata Spring CC
  const courseAmata = await prisma.course.create({ data: { course_name: "Amata Spring Country Club", location: "เมือง ชลบุรี" } });
  const amataOut = await prisma.section.create({ data: { course_id: courseAmata.course_id, section_name: "Out (Hole 1-9)" } });
  const amataIn = await prisma.section.create({ data: { course_id: courseAmata.course_id, section_name: "In (Hole 10-18)" } });

  const amataHolesSpecs = [
    { hole_no: 1, par: 4, index: 17 }, { hole_no: 2, par: 5, index: 9 }, { hole_no: 3, par: 4, index: 3 },
    { hole_no: 4, par: 4, index: 1 }, { hole_no: 5, par: 3, index: 15 }, { hole_no: 6, par: 4, index: 13 },
    { hole_no: 7, par: 5, index: 7 }, { hole_no: 8, par: 3, index: 11 }, { hole_no: 9, par: 4, index: 5 },
    { hole_no: 10, par: 4, index: 14 }, { hole_no: 11, par: 5, index: 18 }, { hole_no: 12, par: 4, index: 10 },
    { hole_no: 13, par: 3, index: 16 }, { hole_no: 14, par: 4, index: 2 }, { hole_no: 15, par: 5, index: 8 },
    { hole_no: 16, par: 4, index: 6 }, { hole_no: 17, par: 3, index: 12 }, { hole_no: 18, par: 4, index: 4 }
  ];

  const amataHoles: any[] = [];
  for (const hSpec of amataHolesSpecs) {
    const sId = hSpec.hole_no <= 9 ? amataOut.section_id : amataIn.section_id;
    const h = await prisma.hole.create({
      data: { section_id: sId, hole_no: hSpec.hole_no, par: hSpec.par, index: hSpec.index }
    });
    amataHoles.push(h);
  }

  // 🏛️ สนามที่ 2: Pattavia Century GC
  const coursePattavia = await prisma.course.create({ data: { course_name: "Pattavia Century Golf Club", location: "บ้านบึง ชลบุรี" } });
  const pattaviaOut = await prisma.section.create({ data: { course_id: coursePattavia.course_id, section_name: "Out (Hole 1-9)" } });
  const pattaviaIn = await prisma.section.create({ data: { course_id: coursePattavia.course_id, section_name: "In (Hole 10-18)" } });

  const pattaviaHolesSpecs = [
    { hole_no: 1, par: 4, index: 13 }, { hole_no: 2, par: 4, index: 9 }, { hole_no: 3, par: 5, index: 7 },
    { hole_no: 4, par: 3, index: 17 }, { hole_no: 5, par: 4, index: 15 }, { hole_no: 6, par: 5, index: 1 },
    { hole_no: 7, par: 3, index: 3 },  { hole_no: 8, par: 4, index: 5 }, { hole_no: 9, par: 4, index: 11 },
    { hole_no: 10, par: 4, index: 16 }, { hole_no: 11, par: 4, index: 10 }, { hole_no: 12, par: 5, index: 4 },
    { hole_no: 13, par: 3, index: 18 }, { hole_no: 14, par: 4, index: 12 }, { hole_no: 15, par: 4, index: 14 },
    { hole_no: 16, par: 4, index: 2 },  { hole_no: 17, par: 3, index: 6 },  { hole_no: 18, par: 5, index: 8 }
  ];

  for (const hSpec of pattaviaHolesSpecs) {
    const sId = hSpec.hole_no <= 9 ? pattaviaOut.section_id : pattaviaIn.section_id;
    await prisma.hole.create({ data: { section_id: sId, hole_no: hSpec.hole_no, par: hSpec.par, index: hSpec.index } });
  }

  // 🏛️ สนามที่ 3: Khao Kheow CC (Course A-B)
  const courseKhaoKheow = await prisma.course.create({ data: { course_name: "Khao Kheow Country Club (A-B)", location: "ศรีราชา ชลบุรี" } });
  const kkOut = await prisma.section.create({ data: { course_id: courseKhaoKheow.course_id, section_name: "Course A (Out 1-9)" } });
  const kkIn = await prisma.section.create({ data: { course_id: courseKhaoKheow.course_id, section_name: "Course B (In 10-18)" } });

  const kkHolesSpecs = [
    { hole_no: 1, par: 4, index: 17 }, { hole_no: 2, par: 5, index: 7 }, { hole_no: 3, par: 3, index: 13 },
    { hole_no: 4, par: 4, index: 1 }, { hole_no: 5, par: 3, index: 15 }, { hole_no: 6, par: 4, index: 9 },
    { hole_no: 7, par: 4, index: 11 }, { hole_no: 8, par: 5, index: 3 }, { hole_no: 9, par: 4, index: 5 },
    { hole_no: 10, par: 4, index: 12 }, { hole_no: 11, par: 5, index: 6 }, { hole_no: 12, par: 3, index: 14 },
    { hole_no: 13, par: 4, index: 10 }, { hole_no: 14, par: 4, index: 18 }, { hole_no: 15, par: 5, index: 8 },
    { hole_no: 16, par: 4, index: 4 }, { hole_no: 17, par: 3, index: 16 }, { hole_no: 18, par: 4, index: 2 }
  ];

  for (const hSpec of kkHolesSpecs) {
    const sId = hSpec.hole_no <= 9 ? kkOut.section_id : kkIn.section_id;
    await prisma.hole.create({ data: { section_id: sId, hole_no: hSpec.hole_no, par: hSpec.par, index: hSpec.index } });
  }

  // 🏛️ สนามที่ 4: Pleasant Valley Golf Club
  const coursePleasantValley = await prisma.course.create({
    data: { course_name: "Pleasant Valley Golf Club", location: "ศรีราชา ชลบุรี" }
  });
  const pvOut = await prisma.section.create({
    data: { course_id: coursePleasantValley.course_id, section_name: "Out (Hole 1-9)" }
  });
  const pvIn = await prisma.section.create({
    data: { course_id: coursePleasantValley.course_id, section_name: "In (Hole 10-18)" }
  });

  const pvHolesSpecs = [
    { hole_no: 1, par: 4, index: 9 },   { hole_no: 2, par: 4, index: 3 },   { hole_no: 3, par: 5, index: 1 },
    { hole_no: 4, par: 4, index: 14 },  { hole_no: 5, par: 3, index: 16 },  { hole_no: 6, par: 5, index: 6 },
    { hole_no: 7, par: 4, index: 18 },  { hole_no: 8, par: 3, index: 12 },  { hole_no: 9, par: 4, index: 4 },
    { hole_no: 10, par: 4, index: 2 },  { hole_no: 11, par: 4, index: 8 },  { hole_no: 12, par: 4, index: 10 },
    { hole_no: 13, par: 3, index: 15 }, { hole_no: 14, par: 4, index: 7 },  { hole_no: 15, par: 5, index: 11 },
    { hole_no: 16, par: 4, index: 5 },  { hole_no: 17, par: 3, index: 17 }, { hole_no: 18, par: 5, index: 13 }
  ];

  for (const hSpec of pvHolesSpecs) {
    const sId = hSpec.hole_no <= 9 ? pvOut.section_id : pvIn.section_id;
    await prisma.hole.create({
      data: { section_id: sId, hole_no: hSpec.hole_no, par: hSpec.par, index: hSpec.index }
    });
  }

  // 🏛️ สนามที่ 5: Mountain Shadow Golf Club
  const courseMountainShadow = await prisma.course.create({
    data: { course_name: "Mountain Shadow Golf Club", location: "เมือง ชลบุรี" }
  });
  const msOut = await prisma.section.create({
    data: { course_id: courseMountainShadow.course_id, section_name: "Out (Hole 1-9)" }
  });
  const msIn = await prisma.section.create({
    data: { course_id: courseMountainShadow.course_id, section_name: "In (Hole 10-18)" }
  });

  const msHolesSpecs = [
    { hole_no: 1, par: 4, index: 11 }, { hole_no: 2, par: 4, index: 7 },  { hole_no: 3, par: 5, index: 5 },
    { hole_no: 4, par: 4, index: 13 }, { hole_no: 5, par: 3, index: 17 }, { hole_no: 6, par: 5, index: 3 },
    { hole_no: 7, par: 4, index: 1 },  { hole_no: 8, par: 3, index: 15 }, { hole_no: 9, par: 4, index: 9 },
    { hole_no: 10, par: 4, index: 14 }, { hole_no: 11, par: 5, index: 10 }, { hole_no: 12, par: 4, index: 8 },
    { hole_no: 13, par: 4, index: 4 },  { hole_no: 14, par: 5, index: 2 },  { hole_no: 15, par: 3, index: 16 },
    { hole_no: 16, par: 4, index: 18 }, { hole_no: 17, par: 3, index: 12 }, { hole_no: 18, par: 4, index: 6 }
  ];

  for (const hSpec of msHolesSpecs) {
    const sId = hSpec.hole_no <= 9 ? msOut.section_id : msIn.section_id;
    await prisma.hole.create({
      data: { section_id: sId, hole_no: hSpec.hole_no, par: hSpec.par, index: hSpec.index }
    });
  }

  // 🏛️ สนามที่ 6: Bangpakong Golf & Country Club (EGAT)
  const courseBangpakong = await prisma.course.create({
    data: { course_name: "Bangpakong Golf & Country Club (EGAT)", location: "บางปะกง ฉะเชิงเทรา" }
  });
  const bpkOut = await prisma.section.create({
    data: { course_id: courseBangpakong.course_id, section_name: "Out (Hole 1-9)" }
  });
  const bpkIn = await prisma.section.create({
    data: { course_id: courseBangpakong.course_id, section_name: "In (Hole 10-18)" }
  });

  const bpkHolesSpecs = [
    { hole_no: 1, par: 4, index: 2 },   { hole_no: 2, par: 3, index: 15 },  { hole_no: 3, par: 4, index: 14 },
    { hole_no: 4, par: 4, index: 9 },   { hole_no: 5, par: 3, index: 17 },  { hole_no: 6, par: 5, index: 3 },
    { hole_no: 7, par: 4, index: 11 },  { hole_no: 8, par: 4, index: 13 },  { hole_no: 9, par: 5, index: 6 },
    { hole_no: 10, par: 4, index: 1 },  { hole_no: 11, par: 3, index: 16 }, { hole_no: 12, par: 4, index: 12 },
    { hole_no: 13, par: 4, index: 7 },  { hole_no: 14, par: 3, index: 18 }, { hole_no: 15, par: 5, index: 5 },
    { hole_no: 16, par: 4, index: 4 },  { hole_no: 17, par: 4, index: 10 }, { hole_no: 18, par: 5, index: 8 }
  ];

  for (const hSpec of bpkHolesSpecs) {
    const sId = hSpec.hole_no <= 9 ? bpkOut.section_id : bpkIn.section_id;
    await prisma.hole.create({
      data: { section_id: sId, hole_no: hSpec.hole_no, par: hSpec.par, index: hSpec.index }
    });
  }

  // 🏛️ สนามที่ 7: Bangpra International Golf Club
  const courseBangpra = await prisma.course.create({
    data: { course_name: "Bangpra International Golf Club", location: "ศรีราชา ชลบุรี" }
  });
  const bpOut = await prisma.section.create({
    data: { course_id: courseBangpra.course_id, section_name: "Out (Hole 1-9)" }
  });
  const bpIn = await prisma.section.create({
    data: { course_id: courseBangpra.course_id, section_name: "In (Hole 10-18)" }
  });

  const bpHolesSpecs = [
    { hole_no: 1, par: 4, index: 3 },   { hole_no: 2, par: 3, index: 15 },  { hole_no: 3, par: 4, index: 11 },
    { hole_no: 4, par: 4, index: 5 },   { hole_no: 5, par: 5, index: 9 },   { hole_no: 6, par: 4, index: 1 },
    { hole_no: 7, par: 5, index: 7 },   { hole_no: 8, par: 3, index: 13 },  { hole_no: 9, par: 4, index: 17 },
    { hole_no: 10, par: 4, index: 18 }, { hole_no: 11, par: 5, index: 2 },  { hole_no: 12, par: 3, index: 16 },
    { hole_no: 13, par: 4, index: 10 }, { hole_no: 14, par: 4, index: 6 },  { hole_no: 15, par: 5, index: 14 },
    { hole_no: 16, par: 4, index: 4 },  { hole_no: 17, par: 3, index: 12 }, { hole_no: 18, par: 4, index: 8 }
  ];

  for (const hSpec of bpHolesSpecs) {
    const sId = hSpec.hole_no <= 9 ? bpOut.section_id : bpIn.section_id;
    await prisma.hole.create({
      data: { section_id: sId, hole_no: hSpec.hole_no, par: hSpec.par, index: hSpec.index }
    });
  }

  // 4. เนรมิตแมตช์แข่งขันทางการ
  console.log('🏆 กำลังเนรมิตแมตช์การแข่งขัน...');
  const tournament = await prisma.tournament.create({
    data: {
      tournament_name: "Amata Alpha Championship 2026",
      tournament_mode: "Stroke Play",
      course_id: courseAmata.course_id,
      event_date: new Date(),
      status: "LIVE"
    }
  });

  // 5. จัดแบ่ง 4 Flights (Group 1 - Group 4)
  console.log('⛳ กำลังจัดผัง 4 ก๊วนแข่งขัน...');
  const flight1 = await prisma.flight.create({ data: { tournament_id: tournament.tournament_id, flight_name: "Group 1", t_off_time: "07:00" } });
  const flight2 = await prisma.flight.create({ data: { tournament_id: tournament.tournament_id, flight_name: "Group 2", t_off_time: "07:08" } });
  const flight3 = await prisma.flight.create({ data: { tournament_id: tournament.tournament_id, flight_name: "Group 3", t_off_time: "07:16" } });
  const flight4 = await prisma.flight.create({ data: { tournament_id: tournament.tournament_id, flight_name: "Group 4", t_off_time: "07:24" } });

  // จัดสมาชิกเข้า 4 ก๊วนแรก
  const grp1Users = [createdGolfers[0], createdGolfers[1], createdGolfers[2], createdGolfers[3], uNarapati];
  const grp2Users = [createdGolfers[4], uPapoo, createdGolfers[5], createdGolfers[6], uNoppadon];
  const grp3Users = [createdGolfers[7], createdGolfers[8], createdGolfers[9], createdGolfers[10], uVasun];
  const grp4Users = [createdGolfers[11], createdGolfers[12], createdGolfers[13], createdGolfers[14], uVittavas];

  const assignMembers = async (flightId: number, userArray: any[]) => {
    for (const u of userArray) {
      await prisma.flightMember.create({
        data: { flight_id: flightId, user_id: u.user_id, calculated_hd: 0, calculated_net: 0 }
      });
    }
  };

  await assignMembers(flight1.flight_id, grp1Users);
  await assignMembers(flight2.flight_id, grp2Users);
  await assignMembers(flight3.flight_id, grp3Users);
  await assignMembers(flight4.flight_id, grp4Users);

  // 6. เติมคะแนนดิบครบ 18 หลุมทดสอบ
  console.log('📝 กำลังเติมคะแนนทดสอบครบ 18 หลุมให้ผู้เล่นทุกคนในก๊วน...');
  const allFlightGroups = [
    { flight: flight1, users: grp1Users },
    { flight: flight2, users: grp2Users },
    { flight: flight3, users: grp3Users },
    { flight: flight4, users: grp4Users }
  ];

  for (const grp of allFlightGroups) {
    for (const u of grp.users) {
      for (const h of amataHoles) {
        const mockStrokes = h.par + (Math.floor(Math.random() * 3));
        await prisma.score.create({
          data: {
            flight_id: grp.flight.flight_id,
            user_id: u.user_id,
            hole_id: h.hole_id,
            strokes: mockStrokes
          }
        });
      }
    }
  }

  console.log('✅ Re-Seed สำเร็จเรียบร้อย! 24 นักกอล์ฟ (Argon2 Hashed) | 7 สนาม | 4 ก๊วน พร้อมแล้วครับป๋าปู! 🚀');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });