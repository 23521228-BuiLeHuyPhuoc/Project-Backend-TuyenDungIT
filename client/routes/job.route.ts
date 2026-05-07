import {Router} from 'express';
import * as jobController from '../controllers/job.controller';
const router = Router();

router.get('/detail/:slug',jobController.detail);

export default router;