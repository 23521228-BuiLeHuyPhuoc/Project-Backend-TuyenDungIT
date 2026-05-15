import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
const router = Router();
import multer from 'multer';
import { storage } from '../../helpers/cloudinary.helper';
import * as jobValidate from '../validates/job.validate';
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 //5MB
    }, fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            cb(null, false);
            return;
        }
        cb(null, true);
    }
});

router.get('/detail/:slug', jobController.detail);

router.post('/apply',
    jobValidate.applyPost,
    upload.single('fileCV'),
    jobController.applyPost);

export default router;