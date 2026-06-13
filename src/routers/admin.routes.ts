import {Router} from 'express';

const adminRouter = Router();

adminRouter.post('/user/addGolfCourse', (req, res) => {});
adminRouter.put('/user/changeRole', (req, res) => {});
adminRouter.delete('/user/delete', (req, res) => {});
adminRouter.post('/course/register', (req, res) => {});
adminRouter.post('/tournament/register', (req, res) => {});
adminRouter.post('/tournament/editScore', (req, res) => {});
adminRouter.post('/tournament/close', (req, res) => {});

export default adminRouter;