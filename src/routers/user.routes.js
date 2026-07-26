// src/routers/user.routes.ts
import { Router } from 'express';
import * as userTournamentController from '../controllers/user/user.tournament.controller.js'; //[cite: 6, 27]
const userRouter = Router(); //[cite: 27]
// 🎯 ท่อที่ 1: ดึงรายชื่อทัวร์นาเมนต์ทั้งหมด (ดึงสำเร็จแล้ว 200 OK)[cite: 27]
userRouter.get('/tournaments', userTournamentController.getAllTournaments);
// 🎯 ท่อที่ 2: งอกสะพานเชื่อมสัญญาณลีดเดอร์บอร์ดสาธารณะตามพิมพ์เขียว Spec
userRouter.get('/tournament/:tournament_id/leaderboard', userTournamentController.getPublicLeaderboard);
// 🎯 ท่อที่ 3: ดึงใบคะแนนส่วนบุคคล (Scorecard) สดจาก DB
userRouter.get('/scorecard/:userId', userTournamentController.getPlayerScoreCard);
export default userRouter; //[cite: 27]
//# sourceMappingURL=user.routes.js.map