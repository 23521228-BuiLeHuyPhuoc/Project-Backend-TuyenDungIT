import{Router} from 'express';
import * as userController from '../controllers/user.controller';
import * as userValidate from '../validates/user.validate';
import multer from 'multer';
import { storage } from '../../helpers/cloudinary.helper';
import { verifyTokenUser } from '../middlewares/auth.middleware';
const upload = multer({ storage: storage });
const router = Router();

router.post('/register', 
    userValidate.registerValidate, 
    userController.registerPost);
router.post('/login',
    userValidate.loginValidate,
    userController.loginPost);
router.patch('/profile',verifyTokenUser,upload.single('avatar'),userController.profilePatch);
export default router;