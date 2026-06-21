import  {Router} from 'express';
import authRouter from './auth.routes.js';
import adminRouter from './admin.routes.js';
import scorerRouter from './scorer.routes.js';
import tdRouter from './td.routes.js';

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/admin', adminRouter);
mainRouter.use('/td', tdRouter);
mainRouter.use('/scorer', scorerRouter);

export default mainRouter;