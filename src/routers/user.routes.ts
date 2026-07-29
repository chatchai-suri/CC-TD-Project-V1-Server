// src/routers/user.routes.ts
import { Router } from 'express';
import * as userTournamentController from '../controllers/user/user.tournament.controller.js';

const userRouter = Router();

// 🎯 ท่อที่ 1: ดึงรายชื่อทัวร์นาเมนต์ทั้งหมด
userRouter.get('/tournaments', userTournamentController.getAllTournaments);

// 🎯 ท่อที่ 2: ดึงรายชื่อผู้ใช้งานทั้งหมดในตู้ DB (สำหรับจัดก๊วน / Admin)
userRouter.get('/all', userTournamentController.getAllUsers);

// 🎯 ท่อที่ 3: งอกสะพานเชื่อมสัญญาณลีดเดอร์บอร์ดสาธารณะตามพิมพ์เขียว Spec
userRouter.get('/tournament/:tournament_id/leaderboard', userTournamentController.getPublicLeaderboard);

// 🎯 ท่อที่ 4: ดึงใบคะแนนส่วนบุคคล (Scorecard) สดจาก DB
userRouter.get('/scorecard/:userId', userTournamentController.getPlayerScoreCard);

export default userRouter;