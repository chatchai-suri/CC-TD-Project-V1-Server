import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // 🎯 ทางสว่างสากลนิยมประจำรุ่น Zod v4: ไร้เส้นแดง ไร้รอยขีดฆ่ากลาง คลีนกริบ 100%
  if (err instanceof ZodError) {
    const zodErrors = err.issues.reduce((acc: any, curr: any) => ({
      ...acc,
      [curr.path.join('.')]: curr.message
    }), {});

    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: zodErrors
    });
    return;
  }

  // 🎯 2. ดักจับเอเรอร์จากระบบคู่แฝด createError.ts หรือเอเรอร์ทั่วไปของเซิร์ฟเวอร์ Express 5
  // แก้ไข: เปลี่ยนจาก err.status เป็น err.statusCode ให้ตรงตามข้อตกลงจักรวาลพิมพ์เขียวแล้วครับป๋า!
  const statusCode = err.statusCode || 500; 
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    errors: err.errors || null
  });
};

export default errorMiddleware;