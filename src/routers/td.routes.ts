import { Router } from 'express';
import { 
  getFlightSetup, 
  setupFlightWithMembers, 
  updateFlightInfo, 
  changeFlightMembers, 
  deleteFlight 
} from '../controllers/td/td.flight.controller.js';
import { 
  registerTournament, 
  updateTournament,
  deleteTournament,
  getTournamentLeaderboard, 
  closeTournament,
  reopenTournamentToLive,
  updateTournamentStatus,
  getAllTournaments
} from '../controllers/td/td.tournament.controller.js';
import {
  registerCourse,
  getAllCourses,
  updateCourse,
  deleteCourse
} from '../controllers/td/td.course.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const tdRouter = Router();

// 🔒 ด่านตรวจกลาง: ล็อกทุก Endpoint ภายใต้ /api/v1/td ให้เฉพาะ TD และ ADMIN เท่านั้น
tdRouter.use(authenticate, authorize('TD', 'ADMIN'));

// บรรทัดข้างล่างนี้ทั้งหมด (GET, POST, PUT, DELETE) จะปลอดภัยโดยอัตโนมัติ 100%
// ⛳ Course Management (เพิ่มส่วนนี้เข้ามาครับ)
tdRouter.post('/courses', registerCourse);
tdRouter.get('/courses', getAllCourses);
tdRouter.put('/courses/:course_id', updateCourse);
tdRouter.delete('/courses/:course_id', deleteCourse);

// 🏆 Tournament Resources (CRUD)
tdRouter.get("/tournaments", getAllTournaments);
tdRouter.post('/tournaments', registerTournament);                                 // Create
tdRouter.put('/tournaments/:tournament_id', updateTournament);                     // Update
tdRouter.delete('/tournaments/:tournament_id', deleteTournament);                  // Delete
tdRouter.get('/tournaments/:tournament_id/leaderboard', getTournamentLeaderboard); // Read Leaderboard

// 🟢 บรรทัดเปิดท่อสลับสถานะ (Hybrid Status Switching)
tdRouter.patch("/tournaments/:tournament_id/status", updateTournamentStatus);

// 🎯 สวิตช์สลับสถานะและปิดแมตช์ (Close / Reopen)
tdRouter.put('/tournaments/:tournament_id/close', closeTournament);
tdRouter.put('/tournaments/:tournament_id/reopen', reopenTournamentToLive);

// ⛳ Flight Resources
tdRouter.get('/tournaments/:tournament_id/flights', getFlightSetup);
tdRouter.post('/tournaments/:tournament_id/flights', setupFlightWithMembers);
tdRouter.put('/flights/:flight_id', updateFlightInfo);
tdRouter.put('/flights/:flight_id/members', changeFlightMembers);
tdRouter.delete('/flights/:flight_id', deleteFlight);

export default tdRouter;