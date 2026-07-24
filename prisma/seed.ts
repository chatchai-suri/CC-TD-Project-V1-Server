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
  
  // 👑 1. บัญชี Papoo สิทธิ์ SCORER (เพื่อเข้าหน้าคีย์แต้มได้ทันที)
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

  const parSpecs = [4,5,3,4,4,4,4,3,4, 4,5,3,4,4,4,4,3,4];
  const holes: any[] = [];
  for (let i = 1; i <= 18; i++) {
    const s_id = i <= 9 ? sectionOut.section_id : sectionIn.section_id;
    const h = await prisma.hole.create({ data: { section_id: s_id, hole_no: i, par: parSpecs[i-1] } });
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

  console.log('✅ Re-Seed Plain Text เรียบร้อย!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });