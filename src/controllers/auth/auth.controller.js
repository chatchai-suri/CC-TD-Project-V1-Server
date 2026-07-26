import { prisma } from '../../config/prisma.js'; // 🔁 นำเข้า Instance ฐานข้อมูลพ่วง .js ตามกฎข้อที่ 3 ของสโมสร
import { createError } from '../../utils/createError.js'; // 🔁 ตัวดักจับข้อผิดพลาดส่วนกลางที่ป๋าปูวางท่อไว้
/**
 * 🎯 POST: /api/v1/auth/register (ลอจิกการลงทะเบียนนักกอล์ฟและแคดดี้เข้าระบบ)
 * 🔒 เลเยอร์ 4 ชั้น Express v5 Compliance ปราศจาก Try-Catch บวมรกสายตา
 */
export const registerUser = async (req, res, next) => {
    // 📥 4.1 Request Management: แกะห่อพัสดุรับช่วงข้อมูลขาเข้า
    const { username, password, fullname, nickname, phone_number, age } = req.body;
    // 🛡️ 4.2 Validation & 4.3 Error Handling: ด่านตรวจสัญญาณเด็ดขาด
    if (!fullname) {
        throw createError(400, "ไม่สามารถลงทะเบียนได้: กรุณาระบุชื่อ-นามสกุลจริงด้วยครับป๋า!");
    }
    // ดักจับรายชื่อยูสเซอร์เนมซ้ำซ้อนระดับชั้นแอปพลิเคชัน (Strict checking)
    if (username) {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            throw createError(400, `Username "${username}" นี้มีคนใช้ในสนามแล้วครับป๋า!`);
        }
    }
    // 🏗️ 4.4 Action Steps: สลักข้อมูลลงตู้ MySQL ผ่านอุโมงค์พอร์ต 3307
    const newUser = await prisma.user.create({
        data: {
            username: username || null,
            password: password || null, // 👈 เฟสแรกคงสายอักขระดิบตามความต้องการของป๋าปูเพื่อพรูฟ Data Flow
            fullname,
            nickname: nickname || null,
            phone_number: phone_number || null,
            age: age ? Number(age) : null, // 👈 มั่นใจว่าเป็นสัญญานประเภท Int ป้องกัน Type หลังบ้านเพี้ยน
            global_role: "GOLFER" // 👈 ค่าเริ่มต้นสากลนิยมฝั่งโมดูลผู้เล่น
        }
    });
    // 📤 4.n+1 Response Management: ส่งข้อมูลสถานะสีเขียวสำเร็จกลับไปกางตารางหน้าบ้าน
    return res.status(201).json({
        success: true,
        message: `สลักชื่อนักกอล์ฟ "${fullname}" เข้าสู่ระบบท่อฐานข้อมูลเรียบร้อยแล้วครับป๋า! 🏌️‍♂️`,
        data: {
            user_id: newUser.user_id,
            username: newUser.username,
            fullname: newUser.fullname
        }
    });
};
/**
 * 🎯 POST: /api/v1/auth/login (ลอจิกดักเช็คพาสเวิร์ดเพื่อแจกตั๋วสิทธิ์ควบคุม)
 * 🔒 เลเยอร์ 4 ชั้น Express v5 Compliance ไหลคลีนจากบนลงล่าง
 */
export const login = async (req, res, next) => {
    // 📥 4.1 Request Management
    const { username, password } = req.body;
    // 🛡️ 4.2 Validation & 4.3 Error Handling
    if (!username || !password) {
        throw createError(400, "กรุณากรอก username และ password ให้ครบถ้วนด้วยครับป๋า");
    }
    // 🏗️ 4.4 Action Steps: ค้นหาชื่อยูสเซอร์ในถัง MySQL ผ่านเครือข่ายความปลอดภัย
    const user = await prisma.user.findUnique({
        where: { username: username },
    });
    // ⚠️ หากควานหาในตู้ฐานข้อมูลแล้วไม่พบชื่อผู้ใช้งาน ให้โยน Error ทันที
    if (!user) {
        throw createError(404, "ไม่พบชื่อผู้ใช้งานนี้ในระบบคลับครับป๋า!");
    }
    // ตรวจสอบรหัสผ่านสายอักขระดิบเคลียร์หน้างานช่วงตั้งไข่
    if (user.password !== password) {
        throw createError(400, "รหัสผ่านไม่ถูกต้อง กรุณาเช็ควงสวิงอีกครั้งครับป๋า!");
    }
    // 📤 4.n+1 Response Management: ผ่านฉลุย ส่งสิทธิ์กลับไปกางปุ่มหน้าบ้าน React
    return res.status(200).json({
        success: true,
        message: `ยินดีต้อนรับกลับสู่สนามครับ ป๋าได้สิทธิ์ในฐานะ [${user.global_role}] ⛳`,
        data: {
            user_id: user.user_id,
            username: user.username,
            fullname: user.fullname,
            global_role: user.global_role
        }
    });
};
//# sourceMappingURL=auth.controller.js.map