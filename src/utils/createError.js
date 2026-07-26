// src/utils/createError.ts
/**
 * 🎯 วัตถุประสงค์หลัก: ตัวสร้างวัตถุข้อผิดพลาดมาตรฐาน (Custom Error Generator)
 * 🛡️ ระเบียบระบบ: สอดคล้องกับระเบียบ Express v5 Handling ปราศจาก Try-Catch ซ้ำซ้อน
 */
/**
 * ฟังก์ชันสร้าง Custom Error พ่วง Status Code ส่งออกระบบ
 * @param statusCode รหัสสถานะ HTTP Error เช่น 400, 401, 403, 404
 * @param message ข้อความดิบแจ้งเตือนความผิดพลาดภาษาไทย
 */
export function createError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
//# sourceMappingURL=createError.js.map