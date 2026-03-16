import express, { Request, Response } from 'express';
export const registerPost=(req:Request,res:Response)=>{
console.log(req.body);
    res.json({
        message: 'Đăng ký thành công!',
        code: 'success'
    })

}