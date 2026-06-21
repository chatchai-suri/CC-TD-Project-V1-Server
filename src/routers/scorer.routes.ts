import {Router} from 'express';
import { recordHoleScore } from '../controllers/scorer/tournament.controller.js';

const scorerRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/scorer
scorerRouter.post('/tournament/recordHoleScore', recordHoleScore);

export default scorerRouter;