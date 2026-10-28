// prisma/migrate-passwords.ts
declare const process: any; // 👈 สยบเส้นแดง process ทันที
import 'dotenv/config';
import { prisma } from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.util.js';

async function main() {
  console.log('🔄 เริ่มต้นปฏิบัติการ Password Migration สู่ Argon2 บน Local DB...');

  // 1. ดึงรายชื่อผู้ใช้ทั้งหมดในตาราง users
  const users = await prisma.user.findMany({
    orderBy: { user_id: 'asc' }
  });
  console.log(`📋 ตรวจสอบพบประชากรทั้งหมด ${users.length} รายการ\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    // 🛡️ เคส 1: ข้ามหากไม่มีรหัสผ่าน
    if (!user.password) {
      console.log(`⏩ [ID: ${user.user_id}] ${user.username || user.fullname} : ไม่มีรหัสผ่าน (ข้าม)`);
      skippedCount++;
      continue;
    }

    // 🛡️ เคส 2: ข้ามหากรหัสผ่านเป็น Argon2 Hash อยู่แล้ว
    if (user.password.startsWith('$argon2')) {
      console.log(`✅ [ID: ${user.user_id}] ${user.username || user.fullname} : เป็น Argon2 Hash อยู่แล้ว (ข้าม)`);
      skippedCount++;
      continue;
    }

    // 🔒 เคส 3: รหัสผ่าน Plain Text ดั้งเดิม -> แฮชด้วย Argon2
    const hashedPassword = await hashPassword(user.password);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword }
    });

    console.log(`🔒 [ID: ${user.user_id}] ${user.username || user.fullname} : แปลงเป็น Argon2 สำเร็จ`);
    migratedCount++;
  }

  console.log('\n====================================================');
  console.log(`🎉 ผลลัพธ์การรัน Migration:`);
  console.log(`   - แปลงรหัสผ่านสำเร็จ: ${migratedCount} บัญชี`);
  console.log(`   - บัญชีที่ข้าม (ไม่ต้องแปลง): ${skippedCount} บัญชี`);
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดระหว่าง Migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });