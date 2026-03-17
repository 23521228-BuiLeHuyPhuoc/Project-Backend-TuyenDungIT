import {Request,Response,NextFunction} from 'express';
import Joi from 'joi';
import { Schema } from 'mongoose';

export const registerValidate=(req:Request,res:Response,next:NextFunction)=>{
    const schema=Joi.object({
        fullName:Joi.string().required()
        .min(5).max(50).messages({
            'string.empty':'Full name không được để trống!',
            'string.min':'Full name phải có ít nhất 5 ký tự!',
            'string.max':'Full name không được vượt quá 50 ký tự!'
        })
        ,
        email:Joi.string().email().required().messages({
            'string.empty':'Email không được để trống!',
            'string.email':'Email không hợp lệ!'
        }),
        password:Joi.string().required()
        .min(6).custom((value,helpers)=>{
            if(!/[A-Z]/.test(value)){
                return helpers.error('password.uppercase');
            }
            if(!/[a-z]/.test(value)){
                return helpers.error('password.lowercase');
            }
            if(!/[0-9]/.test(value)){
                return helpers.error('password.numbers');
            }
            if(!/[!@#$%^&*(),.?":{}|<>]/.test(value)){
                return helpers.error('password.special');
            }
            return value;
        })
        .messages({
            'string.empty':'Password không được để trống!',
            'string.min':'Password phải có ít nhất 6 ký tự!',
            'password.uppercase':'Password phải chứa ít nhất một chữ cái viết hoa!',
            'password.lowercase':'Password phải chứa ít nhất một chữ cái viết thường!',
            'password.numbers':'Password phải chứa ít nhất một số!',
            'password.special':'Password phải chứa ít nhất một ký tự đặc biệt!'
        })

})
const {error}=schema.validate(req.body);
if(error){
    return res.json({
        message: error.details[0].message,
        code: 'error'
    })
}
next();
};
