import { Request, Response } from 'express';
import accountUser from '../models/account-user.model';
import bcrypt from 'bcryptjs';
import { JsonWebTokenError } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { AccountRequest } from '../../interfaces/request.interface';
export const registerPost=async (req:Request,res:Response)=>{
    const {fullName,email,password}=req.body;
    const existAccount=await accountUser.findOne({email});
    if(existAccount)
    {
        return res.json({
            message: 'Email đã tồn tại!',
            code: 'error'
        })
    }
    const salt=await bcrypt.genSalt(10);
    const hashPassword=await bcrypt.hash(password,salt);
    const newAccount=new accountUser({
        fullName:fullName,
        email:email,
        password:hashPassword
    })
    await newAccount.save();
    console.log(req.body);
    res.json({
        message: 'Đăng ký thành công!',
        code: 'success'
    })

}
export const loginPost=async (req:Request,res:Response)=>{
    const {email,password}=req.body;
    const existAccount=await accountUser.findOne({
        email:email
    })
    if(!existAccount){
        return res.json({
            message: 'Email không tồn tại!',
            code: 'error'
        })
    }
    const isPasswordValid=await bcrypt.compare(password,`${existAccount.password}`);
    if(!isPasswordValid){
        return res.json({
            message: 'Mật khẩu không đúng!',
            code: 'error'
        })
    }
    if(isPasswordValid){
        const token=jwt.sign({
            id: existAccount._id,
            email: existAccount.email
        }, 
        `${process.env.JWT_SECRET}`, 
        { expiresIn: '1d' });
        res.cookie('token',token,{
            httpOnly: true,
            maxAge: 1*24*60*60*1000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === 'production'
        })
        res.json({
            message: 'Đăng nhập thành công!',
            code: 'success'
        })
    }
}
export const profilePatch=async(req:AccountRequest,res:Response)=>{
    if(req.file)
    {
        req.body.avatar=req.file.path;
    }
    else{
        delete req.body.avatar;
    }
    const updateAccount=await accountUser.updateOne({
        _id:req.account._id
    },req.body);
    if(!updateAccount)
    {
        return res.json({
            code:"error",
            message:"Cập nhật thất bại"
        })
    }
    res.json({
        code:"success",
        message:"Cập nhật thành công"
    })

}