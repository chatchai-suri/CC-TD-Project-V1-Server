import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; // 
import createError from '../../utils/createError.js'; // 

export const recordHoleScore = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  // แกะกล่องคะแนนดิบรายหลุมตามระเบียบคลิกเลือกจากหน้าจอ Grid Selection ของป๋า
  const { flight_id, user_id, hole_id, strokes } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!flight_id || !user_id || !hole_id || strokes === undefined) {
    throw createError(400, "ไม่สามารถบันทึกแต้มได้: กรุณาส่งพิกัดด่านคีย์คะแนนดิบมาให้ครบถ้วนครับป๋าปู!");
  }

  // ============================================================
  // 4. ACTION STEPS (สะพานสายตรง 3 ประสาน ดึง-คำนวณ-สลัก)
  // ============================================================
  
  // สเต็ป 4.1: ส่องหาแม่แบบข้อมูลหลุม (Hole) เพื่อดึงค่า "Par" ประจำหลุมนั้นมาเตรียมคำนวณย่นเลเยอร์
  const holeSpec = await prisma.hole.findUnique({ // [cite: 1, 9]
    where: { hole_id: Number(hole_id) } // [cite: 1, 9]
  });

  if (!holeSpec) {
    throw createError(404, "ตรวจพบข้อผิดพลาด: ไม่พบรหัสระเบียบหลุมกอล์ฟนี้ในพิมพ์เขียวสนามครับ!");
  }

  // สเต็ป 4.2: ปฏิบัติการ Upsert (ถ้ายังไม่เคยคีย์ให้ create / ถ้าคีย์ซ้ำให้ update ทับไปเลย)
  // ป้องกันอุบัติเหตุนิ้วเปียกสัมผัสพลาดหน้างานได้อย่างประณีตตามวินัย
  const savedScore = await prisma.score.upsert({ // [cite: 1, 14]
    // ค้นหาเป้าหมายเดิมจาก Composite Unique / หรือระบุสลักคะแนนประจำบุคคล
    // ⚠️ Note: เนื่องจากเราต้องการเช็คการแทงซ้ำของ [user_id + hole_id] ป๋าอาจทำ @@unique ไว้ที่ Score ในอนาคต
    // เบื้องต้นใช้ลอจิก ค้นหาคะแนนเก่าที่เคยบันทึกไว้ในแมตช์นี้ หลุมนี้ ของคนนี้ก่อนครับ
    where: {
      score_id: await prisma.score.findFirst({ // [cite: 1, 14]
        where: {
          flight_id: Number(flight_id), // [cite: 1, 14]
          user_id: Number(user_id), // [cite: 1, 14]
          hole_id: Number(hole_id) // [cite: 1, 14]
        }
      }).then(res => res?.score_id || -1) // ถ้าไม่เจอ ส่ง -1 ไปเพื่อให้มันวิ่งไปฝั่ง create [cite: 1, 14]
    },
    update: {
      strokes: Number(strokes), // อัปเดตทับแต้มเก่ากรณีคีย์ผิด [cite: 1, 14]
    },
    create: {
      flight_id: Number(flight_id), // [cite: 1, 14]
      user_id: Number(user_id), // [cite: 1, 14]
      hole_id: Number(hole_id), // [cite: 1, 14]
      strokes: Number(strokes) // [cite: 1, 14]
    }
  });

  // สเต็ป 4.3: คำนวณหาค่าความต่างคะแนน To-Par ณ หลุมนั้นสด ๆ กลางอากาศ
  // สูตรคณิตศาสตร์กอล์ฟสากลนิยม: คะแนนที่ทำได้ (Strokes) - คะแนนมาตรฐานประจำหลุม (Par)
  const currentStrokes = savedScore.strokes; // [cite: 1, 14]
  const holePar = holeSpec.par; // [cite: 1, 8]
  const toParResult = currentStrokes - holePar; 
  
  // แปลงตัวเลขเป็นข้อความให้จดจำและแสดงผลหน้า Leaderboard ง่ายๆ สไตล์กอล์ฟมืออาชีพ
  let toParDisplay = `${toParResult}`;
  if (toParResult === 0) toParDisplay = "E"; // Even Par (เสมอตัว)
  if (toParResult > 0) toParDisplay = `+${toParResult}`; // เกินพาร์ (เช่น +1, +2)

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(200).json({
    success: true,
    message: "สลักคะแนนดิบลงถังข้อมูลเรียบร้อยแล้วครับป๋า!",
    data: {
      score_id: savedScore.score_id, // [cite: 1, 14]
      strokes: currentStrokes,
      hole_par: holePar,
      to_par: toParResult,
      display: toParDisplay // 👈 ตัวอักษรด่านหน้า "E", "+1", "-2" ดึงไปขึ้นจอสมาร์ทโฟนได้ทันที!
    }
  });
};