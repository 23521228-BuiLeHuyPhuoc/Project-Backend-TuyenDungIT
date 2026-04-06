import{Router} from 'express';
import * as companyController from '../controllers/company.controller';
import { registerValidate } from '../validates/company.validate';
import {loginValidate} from '../validates/company.validate'
import { verifyTokenCompany } from '../middlewares/auth.middleware';
import multer from 'multer';
import { storage } from '../../helpers/cloudinary.helper';
const upload = multer({ storage: storage });
const router = Router();

router.post('/register', registerValidate,companyController.registerPost);
router.post('/login',loginValidate,companyController.loginPost);
router.patch('/profile',verifyTokenCompany,upload.single('logo'),companyController.profilePatch);
export default router;
