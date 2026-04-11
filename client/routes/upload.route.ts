
import {Router} from 'express';

import * as uploadController from '../controllers/upload.controller';

import multer from 'multer';

import { storage } from '../../helpers/cloudinary.helper';

const upload = multer({ storage: storage });

const router = Router();

router.post('/image',upload.single('file'),uploadController.imagePost);

export default router;