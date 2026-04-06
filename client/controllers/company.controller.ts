import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AccountCompany from '../models/account-company.model';
import { AccountRequest } from '../../interfaces/request.interface';

export const registerPost =async(req:Request,res:Response)=>{
    const {companyName,email,password}=req.body;
    const existAccount=await AccountCompany.findOne({email});
    if(existAccount){
        return res.json({
            message: 'Email đã tồn tại!',
            code: 'error'
        })
    }
    const salt=await bcrypt.genSalt(10);
    const hashPassword=await bcrypt.hash(password,salt);
    const newAccount=new AccountCompany({
        companyName:companyName,
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
export const loginPost=async(req:Request,res:Response)=>{
    const {email,password}=req.body;
    const existAccount=await AccountCompany.findOne({
        email:email
    })
    if(!existAccount){
        return res.json({
            code:'error',
            message:"Email không tồn tại"
        })
    }
    const isMatch=await bcrypt.compare(password,`${existAccount.password}`);
    if(!isMatch){
        return res.json({
            code:'error',
            message:"Mật khẩu không chính xác"
        })
    }
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
        code:'success',
        message:'Đăng nhập thành công'
    })
}
export const profilePatch=async (req:AccountRequest,res:Response)=>{
    if(req.file){
        req.body.logo=req.file.path;
    }
    else{
        delete req.body.logo;
    }
    const existAccount=await AccountCompany.findOne({
        _id:req.company.id
    })
    if(!existAccount){
        return res.json({
            code:'error',
            message:"Email không tồn tại"
        })
    }
    await AccountCompany.updateOne({
        _id:req.company.id
    },req.body);
    res.json({
        code:'success',
        message:'Cập nhật thành công'
    })
}