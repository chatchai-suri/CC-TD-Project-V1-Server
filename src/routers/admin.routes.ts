import {Router} from 'express';
import {registerCourse} from '../controllers/admin/course.controller.js';
import {addGolfer} from '../controllers/admin/user.controller.js';

const adminRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/admin

adminRouter.post('/user/addGolfer', addGolfer);
adminRouter.put('/user/changeRole', (req, res) => {});
adminRouter.delete('/user/delete', (req, res) => {});
adminRouter.post('/course/register', registerCourse);
adminRouter.post('/tournament/register', (req, res) => {});
adminRouter.post('/tournament/editScore', (req, res) => {});
adminRouter.post('/tournament/close', (req, res) => {});

export default adminRouter;