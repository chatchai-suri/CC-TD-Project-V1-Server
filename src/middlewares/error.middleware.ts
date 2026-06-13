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

  // 🎯 ดักจับกรณีเอเรอร์ทั่วไปของเซิร์ฟเวอร์ Express 5
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
};

export default errorMiddleware;