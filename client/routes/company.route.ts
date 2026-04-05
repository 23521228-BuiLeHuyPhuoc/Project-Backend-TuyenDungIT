import{Router} from 'express';
import * as companyController from '../controllers/company.controller';
import { registerValidate } from '../validates/company.validate';
import {loginValidate} from '../validates/company.validate'
const router = Router();

router.post('/register', registerValidate,companyController.registerPost);
router.post('/login',loginValidate,companyController.loginPost)
export default router;
