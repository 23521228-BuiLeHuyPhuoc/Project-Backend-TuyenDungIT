import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccountUser from "../models/account-user.model";
dotenv.config();
interface AccountRequest extends Request {
    account?:any
}

export const verifyTokenUser=async(req:AccountRequest,res:Response,next:NextFunction)=>{
  const token=req.cookies.token;
  if(!token){
    return res.json({
        code:"error",
        message:"Bạn chưa đăng nhập"
    })
  }
  const decoded=jwt.verify(token,`${process.env.JWT_SECRET}`)as jwt.JwtPayload;
  const {id,email}=decoded;
  const existAccount=await AccountUser.findOne({
    _id:id,
    email:email
  })
  if(!existAccount)
  {
    res.clearCookie("token");
    return res.json({
        code:"error",
        message:"Bạn không có quyền truy cập"
    })
  }
  req.account=existAccount;
  next();

}
    
