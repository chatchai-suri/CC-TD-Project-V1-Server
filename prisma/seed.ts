// Golf-TD-Server/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'golf_root_password',
  database: process.env.DB_NAME || 'tournament_director_db',
  connectionLimit: 2,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 เริ่มต้นปฏิบัติการ Re-Seed รหัสผ่านดิบ (Plain Text)...');

  // ล้างตารางเรียงลำดับ
  await prisma.score.deleteMany({});
  await prisma.flightMember.deleteMany({});
  await prisma.flight.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.hole.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.course.deleteMany({});

  // 🔑 รหัสผ่านดิบสอดคล้องกับ auth.controller.ts
  const plainPassword = "123456";

  console.log('👥 บรรจุ User พร้อม Plain Password "123456"...');
  
  // 👑 1. บัญชี Papoo สิทธิ์ TD
  const uPapoo = await prisma.user.create({
    data: { fullname: "Chatchai Suriyawan", nickname: "Papoo", username: "papoo", password: plainPassword, global_role: Role.TD }
  });

  // 🎯 2. สมาชิกก๊วนอื่นๆ
  const u1 = await prisma.user.create({
    data: { fullname: "Nobita Nobi", nickname: "Nobita", username: "nobita", password: plainPassword, global_role: Role.SCORER }
  });
  const u2 = await prisma.user.create({
    data: { fullname: "Shizuka Minamoto", nickname: "Shizuka", username: "shizuka", password: plainPassword, global_role: Role.GOLFER }
  });
  const u3 = await prisma.user.create({
    data: { fullname: "Takeshi Goda", nickname: "Gian", username: "gian", password: plainPassword, global_role: Role.GOLFER }
  });
  const u4 = await prisma.user.create({
    data: { fullname: "Suneo Honekawa", nickname: "Suneo", username: "suneo", password: plainPassword, global_role: Role.GOLFER }
  });
  const u5 = await prisma.user.create({
    data: { fullname: "Dekisugi Hidetoshi", nickname: "Dekisugi", username: "dekisugi", password: plainPassword, global_role: Role.SCORER }
  });

  // --- สร้าง Course & Tournament (สถานะ LIVE) ---
  const course = await prisma.course.create({
    data: { course_name: "Amata Spring Country Club", location: "ชลบุรี" }
  });

  const sectionOut = await prisma.section.create({ data: { course_id: course.course_id, section_name: "Out (Hole 1-9)" } });
  const sectionIn = await prisma.section.create({ data: { course_id: course.course_id, section_name: "In (Hole 10-18)" } });

  // ⛳ สเปก Par และ Handicap Index จริงของสนาม Amata Spring CC (White Tee - Par 72)
  const amataHolesSpecs = [
    // OUT (1-9) Par 36
    { hole_no: 1, par: 4, index: 17 },
    { hole_no: 2, par: 5, index: 9 },
    { hole_no: 3, par: 4, index: 3 },
    { hole_no: 4, par: 4, index: 1 },
    { hole_no: 5, par: 3, index: 15 },
    { hole_no: 6, par: 4, index: 13 },
    { hole_no: 7, par: 5, index: 7 },
    { hole_no: 8, par: 3, index: 11 },
    { hole_no: 9, par: 4, index: 5 },

    // IN (10-18) Par 36
    { hole_no: 10, par: 4, index: 14 },
    { hole_no: 11, par: 5, index: 18 },
    { hole_no: 12, par: 4, index: 10 },
    { hole_no: 13, par: 3, index: 16 },
    { hole_no: 14, par: 4, index: 2 },
    { hole_no: 15, par: 5, index: 8 },
    { hole_no: 16, par: 4, index: 6 },
    { hole_no: 17, par: 3, index: 12 },
    { hole_no: 18, par: 4, index: 4 }
  ];

  const holes: any[] = [];
  for (const hSpec of amataHolesSpecs) {
    const s_id = hSpec.hole_no <= 9 ? sectionOut.section_id : sectionIn.section_id;
    const h = await prisma.hole.create({
      data: {
        section_id: s_id,
        hole_no: hSpec.hole_no,
        par: hSpec.par,
        index: hSpec.index
      }
    });
    holes.push(h);
  }

  const tournament = await prisma.tournament.create({
    data: {
      tournament_name: "Amata Alpha Championship 2026",
      tournament_mode: "Stroke Play",
      course_id: course.course_id,
      event_date: new Date(),
      status: "LIVE"
    }
  });

  const flightA = await prisma.flight.create({ data: { tournament_id: tournament.tournament_id, flight_name: "Group A", t_off_time: "07:00" } });
  const flightB = await prisma.flight.create({ data: { tournament_id: tournament.tournament_id, flight_name: "Group B", t_off_time: "07:12" } });

  // 🏌️‍♂️ ผูก Papoo ลง Group A
  await prisma.flightMember.createMany({
    data: [
      { flight_id: flightA.flight_id, user_id: uPapoo.user_id, handicap_claim: 0 },
      { flight_id: flightA.flight_id, user_id: u1.user_id, handicap_claim: 0 },
      { flight_id: flightA.flight_id, user_id: u2.user_id, handicap_claim: 0 },
      { flight_id: flightB.flight_id, user_id: u3.user_id, handicap_claim: 0 },
      { flight_id: flightB.flight_id, user_id: u4.user_id, handicap_claim: 0 },
      { flight_id: flightB.flight_id, user_id: u5.user_id, handicap_claim: 0 }
    ]
  });

  console.log('✅ Re-Seed Amata Spring CC (Par 72) เรียบร้อยแล้วครับป๋าปู!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });