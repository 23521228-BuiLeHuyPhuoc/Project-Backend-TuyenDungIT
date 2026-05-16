import { Router } from 'express';

import * as companyController from '../controllers/company.controller';

import { registerValidate } from '../validates/company.validate';

import { loginValidate } from '../validates/company.validate'

import { verifyTokenCompany } from '../middlewares/auth.middleware';

import multer from 'multer';

import { storage } from '../../helpers/cloudinary.helper';

import * as jobController from '../controllers/company.controller';

import * as authMiddleware from '../middlewares/auth.middleware';

const upload = multer({ storage: storage });

const router = Router();

router.post('/register', registerValidate, companyController.registerPost);

router.post('/login', loginValidate, companyController.loginPost);

router.post('/job/create', verifyTokenCompany, upload.array('images', 12), jobController.createJobPost);

router.get('/job/list', verifyTokenCompany, jobController.getListJobPost);

router.get('/job/edit/:id', verifyTokenCompany, jobController.getDetailJob);

router.patch('/job/edit/:id', verifyTokenCompany, upload.array('images', 12), jobController.editJobPatch);

router.patch('/profile', verifyTokenCompany, upload.single('logo'), companyController.profilePatch);

router.delete('/job/delete/:id', verifyTokenCompany, jobController.deleteJobPost);
router.get(
  '/list',
  companyController.list
);
router.get('/detail/:id', companyController.detail);

router.get('/cv/list', authMiddleware.verifyTokenCompany, companyController.listCV);

router.get('/cv/detail/:id', authMiddleware.verifyTokenCompany, companyController.detailCV);

router.patch('/cv/change-status',
  authMiddleware.verifyTokenCompany,
  companyController.changeStatusCVPatch
);

router.delete('/cv/delete/:id', authMiddleware.verifyTokenCompany, companyController.deleteCVPatch);


export default router;
