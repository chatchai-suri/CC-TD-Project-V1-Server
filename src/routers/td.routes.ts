import {Router} from 'express';
import { changeFlightMembers, setupFlightWithMembers, updateFlightInfo } from '../controllers/td/flight.controller.js';


const tdRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/td
tdRouter.post('/course/registerCourse', (req, res) => {});

tdRouter.post('/tournament/registerTournament', (req, res) => {});
tdRouter.put('/tournament/closeTournament', (req, res) => {});

tdRouter.post('/flight/setupFlightWithMembers', setupFlightWithMembers);
tdRouter.put('/flight/changeFlightName', updateFlightInfo);
tdRouter.put('/flight/changeFlightMembers', changeFlightMembers);

export default tdRouter;