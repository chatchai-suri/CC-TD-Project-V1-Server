import {Router} from 'express';

const authRouter = Router();

authRouter.post('/register', (req, res) => {});
authRouter.post('/login', (req, res) => {});
authRouter.post('/getCurrUser', (req, res) => {});

export default authRouter;