// src/controllers/td/td.course.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { createError } from '../../utils/createError.js';

// ⛳ 1. ลงทะเบียนสนามกอล์ฟใหม่ (Register Course พร้อม Section & Holes)
export const registerCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_name, location, sections } = req.body;

    if (!course_name) {
      throw createError(400, "กรุณาระบุชื่อสนามกอล์ฟด้วยครับป๋า!");
    }

    const newCourse = await prisma.course.create({
      data: {
        course_name,
        location: location || null,
        sections: sections && Array.isArray(sections) ? {
          create: sections.map((sec: any) => ({
            section_name: sec.section_name || "A",
            holes: sec.holes && Array.isArray(sec.holes) ? {
              create: sec.holes.map((h: any) => ({
                hole_no: Number(h.hole_no),
                par: Number(h.par || 4),
                index: h.index ? Number(h.index) : null
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        sections: {
          include: { holes: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "ลงทะเบียนสนามกอล์ฟเรียบร้อยแล้วครับป๋า!",
      data: newCourse
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ⛳ 2. ดึงข้อมูลสนามกอล์ฟทั้งหมด (Get All Courses)
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        sections: {
          include: { holes: { orderBy: { hole_no: 'asc' } } }
        }
      },
      orderBy: { course_id: 'asc' }
    });

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลสนามกอล์ฟสำเร็จ",
      data: courses
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ⛳ 3. แก้ไขข้อมูลสนามกอล์ฟ (Update Course)
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course_id = Number(req.params.course_id || req.body.course_id);
    const { course_name, location } = req.body;

    if (!course_id || isNaN(course_id)) {
      throw createError(400, "กรุณาระบุรหัส course_id ให้ถูกต้อง!");
    }

    const updatedCourse = await prisma.course.update({
      where: { course_id },
      data: {
        ...(course_name && { course_name }),
        ...(location !== undefined && { location })
      }
    });

    res.status(200).json({
      success: true,
      message: `อัปเดตข้อมูลสนามกอล์ฟ ID: ${course_id} เรียบร้อยแล้วครับ!`,
      data: updatedCourse
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ⛳ 4. ลบสนามกอล์ฟ (Delete Course)
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course_id = Number(req.params.course_id || req.body.course_id);

    if (!course_id || isNaN(course_id)) {
      throw createError(400, "กรุณาระบุรหัส course_id ให้ถูกต้อง!");
    }

    await prisma.course.delete({
      where: { course_id }
    });

    res.status(200).json({
      success: true,
      message: `ลบสนามกอล์ฟ ID: ${course_id} เรียบร้อยแล้วครับ!`
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};