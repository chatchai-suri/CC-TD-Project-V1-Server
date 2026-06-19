import {Router} from 'express';
import {registerCourse} from '../controllers/admin/course.controller.js';
import {addGolfer, changeRole} from '../controllers/admin/user.controller.js';
import {registerTournament} from '../controllers/admin/tournament.controller.js';

const adminRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/admin

adminRouter.post('/user/addGolfer', addGolfer);
adminRouter.post('/user/changeRole', changeRole);
adminRouter.delete('/user/delete', (req, res) => {});

adminRouter.post('/course/register', registerCourse);

adminRouter.post('/tournament/register', registerTournament);
adminRouter.post('/tournament/editScore', (req, res) => {});
adminRouter.post('/tournament/close', (req, res) => {});

export default adminRouter;