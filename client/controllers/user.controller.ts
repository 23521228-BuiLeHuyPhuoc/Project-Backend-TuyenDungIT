import express, { Request, Response } from 'express';
import accountUser from '../models/account-user.model';
import bcrypt from 'bcryptjs';
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