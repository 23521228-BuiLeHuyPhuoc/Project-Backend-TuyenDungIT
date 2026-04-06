import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
dotenv.config();
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.API_SECRET_KEY// Click 'View API Keys' above to copy your API secret
    });
export const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
});