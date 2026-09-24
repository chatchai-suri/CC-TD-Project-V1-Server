import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import fs from 'fs';

// 🎯 ถ้ามี DB_SSL_CA ใน .env จะเปิดโหมด SSL ให้อัตโนมัติ (สำหรับ Aiven)
// ถ้าไม่มี (เช่นตอนต่อ Local pp2) จะข้ามส่วนนี้ไปเหมือนเดิม
const sslConfig = process.env.DB_SSL_CA
  ? {
      ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
      rejectUnauthorized: true,
    }
  : undefined;

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || '100.83.39.48',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'golf_root_password',
  database: process.env.DB_NAME || 'tournament_director_db',
  connectionLimit: 5,
  ssl: sslConfig, // 🎯 เพิ่มบรรทัดนี้เข้าไป
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;