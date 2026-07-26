import { prisma } from '../../config/prisma.js'; //
import { createError } from '../../utils/createError.js'; // ดึงคัมภีร์ตัวกลางมาใช้งาน (.js เสมอตามระเบียบ)
// 🎯 POST: api/v1/admin/user/addGolfer (ระบบเพิ่มนักกอล์ฟ)
export const addGolfer = async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    // 🎯 ตรวจสอบสิทธิ์ด่านแรก: ถ้ารหัสไม่ตรงกัน สั่งโยนก้อน Error ด้วยบรรทัดเดียวสั้น ๆ ได้เลยครับป๋า
    if (password !== confirmPassword) {
        // โยนก้อนผิดพลาดรหัส 400 ออกไปให้ Express 5 จัดการส่งต่อไปที่ส่วนกลางเองอัตโนมัติ
        throw createError(400, "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับป๋าปู!");
    }
    const newPlayer = await prisma.user.create({
        data: {
            username,
            password,
            fullname: username,
            nickname: "นักกอล์ฟใหม่",
            global_role: "GOLFER" //
        },
    });
    res.status(201).json({
        success: true,
        message: `เพิ่มรายชื่อนักกอล์ฟ ${username} สำเร็จเรียบร้อยครับ! 👤`,
        data: newPlayer,
    });
};
// 🎯 POST: api/v1/admin/user/changeRole (ระบบคุมสิทธิ์เปลี่ยนตำแหน่งนักกอล์ฟ)
export const changeRole = async (req, res) => {
    // ============================================================
    // 1. REQUEST MANAGEMENT (จัดการแกะกล่องนำเข้าข้อมูลจากหน้าด่าน req.body)
    // ============================================================
    const { username, global_role } = req.body;
    // ============================================================
    // 2. VALIDATION & 3. ERROR HANDLING (ตรวจตราคุณสมบัติและดักจับข้อผิดพลาด)
    // ============================================================
    if (!username || !global_role) {
        throw createError(400, "ไม่สามารถเปลี่ยนสิทธิ์ได้: กรุณาระบุ username และ global_role ให้ครบถ้วนครับป๋า!");
    }
    // ค้นหายูสเซอร์ตัวจริงในระบบก่อนสั่งอัปเดต
    const userExists = await prisma.user.findUnique({
        where: { username: username }
    });
    if (!userExists) {
        throw createError(404, "ไม่พบชื่อยูสเซอร์นี้ในสนามกอล์ฟของเราครับป๋า!");
    }
    // ============================================================
    // 4. ACTION STEPS (ขั้นตอนปฏิบัติการสลักปรับสิทธิ์ข้อมูลผ่าน Prisma)
    // ============================================================
    const updatedUser = await prisma.user.update({
        where: { username: username },
        data: { global_role: global_role.toUpperCase() } // ปรับเป็นตัวใหญ่ตามกติกาสากล
    });
    // ============================================================
    // n+1. RESPONSE MANAGEMENT (สรุปผลสำเร็จส่งสถานะสีเขียวกลับหน้าบ้าน)
    // ============================================================
    res.status(200).json({
        success: true,
        message: `สลับบทบาทนักกอล์ฟ ${username} เป็นสิทธิ์ [${updatedUser.global_role}] เรียบร้อยครับป๋า! 👤`,
        data: {
            username: updatedUser.username,
            global_role: updatedUser.global_role
        }
    });
};
//# sourceMappingURL=admin-user.controller.js.map