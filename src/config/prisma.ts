import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// 🎯 ไม้ตายปิดฉากศึก: ป้อนก้อนพิมพ์เขียวตั้งค่ามุดท่อพอร์ต 3307 ให้ PrismaMariaDb ตรง ๆ เลยครับป๋า!
// วิธีนี้ตัดการใช้คำสั่ง mariadb.createPool() ดักหน้าออกไป เส้นแดงหยักจะหายวับไปทันที 100%
const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || '100.83.39.48',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'golf_root_password',
  database: process.env.DB_NAME || 'tournament_director_db',
  connectionLimit: 5,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // 🎯 ส่งอินสแตนซ์ที่ถูกต้องตามข้อกำหนดระบบ ผ่านฉลุยแน่นอนครับป๋า!
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;