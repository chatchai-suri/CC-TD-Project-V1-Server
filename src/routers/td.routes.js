// src/routers/td.routes.ts
import { Router } from 'express';
import { getFlightSetup, setupFlightWithMembers, updateFlightInfo, changeFlightMembers, deleteFlight } from '../controllers/td/td.flight.controller.js';
import { registerTournament, getTournamentLeaderboard, closeTournamentByPeoriaDMN, reopenTournamentToLive } from '../controllers/td/td.tournament.controller.js';
const tdRouter = Router();
// ENDPOINTS Base: http://100.65.78.122:8500/api/v1/td
// 🏆 Tournament Resources
tdRouter.post('/tournaments', registerTournament);
tdRouter.get('/tournaments/:tournament_id/leaderboard', getTournamentLeaderboard);
// 🎯 สวิตช์สลับสถานะแมตช์ Peoria-DMN (ปรับเปลี่ยนชื่อพารามิเตอร์เป็น :tournament_id ให้เป๊ะตรง Controller)
tdRouter.put('/tournaments/:tournament_id/close', closeTournamentByPeoriaDMN); // 👈 แก้ไขเป็น :tournament_id
tdRouter.put('/tournaments/:tournament_id/reopen', reopenTournamentToLive); // 👈 แก้ไขเป็น :tournament_id
// ⛳ Flight Resources
tdRouter.get('/tournaments/:tournament_id/flights', getFlightSetup);
tdRouter.post('/tournaments/:tournament_id/flights', setupFlightWithMembers);
tdRouter.put('/flights/:flight_id', updateFlightInfo);
tdRouter.put('/flights/:flight_id/members', changeFlightMembers);
tdRouter.delete('/flights/:flight_id', deleteFlight);
export default tdRouter;
//# sourceMappingURL=td.routes.js.map