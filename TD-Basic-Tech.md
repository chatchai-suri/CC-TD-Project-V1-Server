## TD-Basic-Tech.md is common & basical techincal or Q&A of technical stack
### Prisma Schema
* model name VS table name (การกำหนดชื่อtable ให้แตกต่างจาก ชื่อmodel)
1. Model name: User vs Table name: user

ในโลกการออกแบบคลังข้อมูลของ Prisma มีข้อตกลงระดับสากล (Convention) ที่กำหนดไว้เพื่อลดความสับสนของนักพัฒนาครับ:

    * ในไฟล์ schema.prisma: บังคับให้ใช้ อักษรตัวพิมพ์ใหญ่ตัวแรก (User, Course) เพื่อระบุชื่อโมเดล (Model Name) ตามระเบียบการเขียน Schema

    * ในโค้ด JavaScript / TypeScript: เมื่อป๋ารันคำสั่ง npx prisma generate ตัว Prisma Client จะทำการสร้างสมองกลแปลงร่าง (Auto-mapping) สลับชื่อเหล่านั้นให้กลายเป็น อักษรตัวพิมพ์เล็กตัวแรก (user, course) ในฐานะฟังก์ชันเรียกใช้งาน (Property/Method) ทันทีครับ

💡 เหตุผลทางสถาปัตยกรรม: เพราะในภาษา JavaScript/TypeScript การเรียกใช้คุณสมบัติของ Object นิยมใช้รูปแบบตัวพิมพ์เล็ก (camelCase) เช่น prisma.user หรือ prisma.course เพื่อให้โค้ดดูสะอาดและถูกหลักสากลนั่นเองครับป๋า
``` prisma
model User {
  user_id       Int            @id @default(autoincrement())
  username      String?        @unique
  password      String?
  fullname      String
  nickname      String?
  phone_number  String?
  age           Int?           // 👈 หยอดฟิลด์อายุประจำตัวนักกอล์ฟ (เผื่อดึงไปคำนวณ Modified-Peoria)
  global_role   String         @default("golfer")
  created_at    DateTime       @default(now())
  
  // Relations
  flights_joined FlightMember[]
}
```
2. Model name: User vs Table name: users

ถ้าในอนาคตป๋าอยากกำหนดชื่อเรียก "ในตู้ MySQL" ให้ต่างออกไป ด้วยคำสั่งอักขระ @@map() บล็อกไว้ด้านล่างสุดของโมเดลได้ดังนี้ครับ:
``` prisma
model User {
  user_id     Int    @id @default(autoincrement())
  username    String @unique
  // ... ฟีลด์อื่น ๆ ของป๋า
  
  @@map("users") // 👈 คำสั่งนี้จะบอกระบบว่า ใน MySQL pp1 ให้สร้างชื่อตารางว่า "users" (ตัวเล็กมี s) นะ!
}
```