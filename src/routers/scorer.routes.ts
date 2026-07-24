import { Router } from 'express';
import { recordScores, getGolferSummary, getMyFlight } from '../controllers/scorer/scorer.controller.js';

const scorerRouter = Router();

// ENDPOINTS Base: /api/v1/scorer

scorerRouter.get('/my-flight', getMyFlight); // 👈 เพิ่ม Route นี้สำหรับดึงข้อมูลก๊วนประจำตัว Scorer
scorerRouter.post('/scores', recordScores); // 👈 POST บันทึกคะแนน[cite: 12]
scorerRouter.get('/tournaments/:tournament_id/users/:user_id/summary', getGolferSummary); // 👈 GET สรุปคะแนน[cite: 12]

export default scorerRouter;