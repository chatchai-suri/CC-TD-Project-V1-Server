// Golf-TD-Server/prisma/seed.ts
declare const process: any; // 👈 สยบเส้นแดง process ใน TS Linter ทันทีตามมาตรฐาน
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

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
  console.log('🌱 เริ่มต้นปฏิบัติการ Re-Seed (20 นักกอล์ฟ + 3 สนาม + คะแนนทดสอบครบ 18 หลุม)...');

  // 1. ล้างตารางเรียงตามระดับ Foreign Key Constraint
  await prisma.score.deleteMany({});
  await prisma.flightMember.deleteMany({});
  await prisma.flight.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.hole.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.course.deleteMany({});

  const plainPassword = "123456";

  // 2. บรรจุรายชื่อประชากร 20 คนตามพิมพ์เขียว namelist.csv
  console.log('👥 กำลังสร้างบัญชีผู้ใช้งาน 20 ท่าน...');

  // 👑 บัญชีหลักป๋าปู (TD)
  const uPapoo = await prisma.user.create({
    data: { fullname: "Chatchai Suriyawan", nickname: "Papoo", username: "papoo", password: plainPassword, global_role: "TD" }
  });

  // 📝 บัญชี SCORER 4 ท่านประจำกลุ่ม
  const uNarapati = await prisma.user.create({ data: { fullname: "Narapati", nickname: "Narapati", username: "narapati", password: plainPassword, global_role: "SCORER" } });
  const uNoppadon = await prisma.user.create({ data: { fullname: "Noppadon", nickname: "Noppadon", username: "noppadon", password: plainPassword, global_role: "SCORER" } });
  const uVasun = await prisma.user.create({ data: { fullname: "Vasun", nickname: "Vasun", username: "vasun", password: plainPassword, global_role: "SCORER" } });
  const uVittavas = await prisma.user.create({ data: { fullname: "Vittavas", nickname: "Vittavas", username: "vittavas", password: plainPassword, global_role: "SCORER" } });

  // 🏌️‍♂️ บัญชี GOLFER ที่เหลือ 15 ท่าน
  const otherPlayers = [
    { fullname: "Morihiro", username: "morihiro" }, { fullname: "Boonrawd", username: "boonrawd" }, { fullname: "Osada", username: "osada" }, { fullname: "Songkiat", username: "songkiat" },
    { fullname: "Taito", username: "taito" }, { fullname: "Konuma", username: "konuma" }, { fullname: "Nipon", username: "nipon" },
    { fullname: "Ariyama", username: "ariyama" }, { fullname: "Prasert", username: "prasert" }, { fullname: "Miokawa", username: "miokawa" }, { fullname: "Chiradool", username: "chiradool" },
    { fullname: "Furui", username: "furui" }, { fullname: "Yuthavee", username: "yuthavee" }, { fullname: "Yamamoto", username: "yamamoto" }, { fullname: "Sarun", username: "sarun" }
  ];

  const createdGolfers: any[] = [];
  for (const p of otherPlayers) {
    const user = await prisma.user.create({
      data: { fullname: p.fullname, nickname: p.fullname, username: p.username, password: plainPassword, global_role: "GOLFER" }
    });
    createdGolfers.push(user);
  }

  // 3. เนรมิต Master Courses 3 สนามแข่งจริง
  console.log('⛳ กำลังลงทะเบียนสนามกอล์ฟ (Amata Spring, Pattavia, Khao Kheow)...');

  // 🏛️ สนามที่ 1: Amata Spring CC
  const courseAmata = await prisma.course.create({ data: { course_name: "Amata Spring Country Club", location: "ชลบุรี" } });
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
  const coursePattavia = await prisma.course.create({ data: { course_name: "Pattavia Century Golf Club", location: "ชลบุรี" } });
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
  const courseKhaoKheow = await prisma.course.create({ data: { course_name: "Khao Kheow Country Club (A-B)", location: "ชลบุรี" } });
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

  // จัดยัดสมาชิกตาม namelist.csv
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
  console.log('📝 กำลังเติมคะแนนทดสอบครบ 18 หลุมให้ผู้เล่นทุกคน...');
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

  console.log('✅ Re-Seed สำเร็จเรียบร้อย! 20 นักกอล์ฟ | 3 สนาม | 4 ก๊วน | สกอร์ครบ 18 หลุม พร้อมทดสอบแล้วครับป๋าปู! 🚀');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });