// 🎯 1. สลักพิมพ์เขียวบอกครูระเบียบว่า AppError ตัวนี้มีคีย์พิเศษแถมมาด้วยนะ
export interface AppError extends Error {
  statusCode?: number;
  success?: boolean;
  errors?: any;
}

// 🎯 2. ฟังก์ชันตัวกลางสำหรับเนรมิตก้อน Error ประจำโปรเจกต์ TD
export default function createError(statusCode: number, message: string, errors: any = null): AppError {
  // สร้างก้อน Error ดั้งเดิมขึ้นมาก่อน
  const error = new Error(message) as AppError;
  
  // ฉีดพ่นคีย์พิเศษเข้าไปทำงานร่วมกับ Global Error Middleware ได้อย่างสมบูรณ์
  error.statusCode = statusCode;
  error.success = false;
  error.errors = errors;

  return error;
}