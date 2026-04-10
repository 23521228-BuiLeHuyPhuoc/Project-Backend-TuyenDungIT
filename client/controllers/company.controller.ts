import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AccountCompany from '../models/account-company.model';
import { AccountRequest } from '../../interfaces/request.interface';
import Job from '../models/job.model';
import City from '../models/city.model';
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
export const createJobPost =async(req:AccountRequest,res:Response)=>{
    req.body.companyId=req.company.id;
    req.body.salaryMin=req.body.salaryMin ? parseInt(req.body.salaryMin):0;
    req.body.salaryMax=req.body.salaryMax ? parseInt(req.body.salaryMax):0;
    req.body.position=req.body.position ? req.body.position:'';
    req.body.workingForm=req.body.workingForm ? req.body.workingForm:'';
    
    req.body.technologies=req.body.technologies ? req.body.technologies.split(", "):[];
    req.body.images=[];
    if(req.files){
        for(const file of req.files as any)
        {
            req.body.images.push(file.path);
        }
    }
    
    const newJob=new Job(req.body);
    await newJob.save();
    
    
    
    
    res.json({
        code :"success",
        message:"Tạo mới công việc thành công"
    })
}
export const getListJobPost=async(req:AccountRequest,res:Response)=>{
    const find={
        companyId:req.company.id
    };
    const page=req.query.page ? parseInt(req.query.page as string):1;
    const limit=req.query.limit ? parseInt(req.query.limit as string):3;
    const skip=(page-1)*limit;
    const totalRecord=await Job.countDocuments(find);
    const totalPage=Math.ceil(totalRecord/limit);
    
    const jobs=await Job.find(find).sort({
        createdAt:"desc"
    }).skip(skip).limit(limit);
    const city= await City.findOne({
        _id:req.company.city
    })
    const dataFinal=[];
    for(const item of jobs)
    {
        dataFinal.push({
             id: item.id,
            companyLogo: req.company.logo,
            title: item.title,
            companyName: req.company.companyName,
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            position: item.position,
            workingForm: item.workingForm,
            companyCity: city?.name,
            technologies: item.technologies

        })
    }
    res.json({
        code:"success",
        jobs:dataFinal,
        totalPage:totalPage
    })
}
export const getDetailJob= async(req:AccountRequest,res:Response)=>{
    const {id}=req.params;
    const existJob=await Job.findOne({
        _id:id,
        companyId:req.company.id
    })
    if(!existJob){
        return res.json({
            code:'error',
            message:"Công việc không tồn tại"
        })
    }
    res.json({
        code:"success",
        jobDetail:existJob
    })
}
export const editJobPatch= async(req:AccountRequest,res:Response)=>{
    const {id}=req.params;
    const existJob=await Job.findOne({
        _id:id,
        companyId:req.company.id
    })
    if(!existJob){
        return res.json({
            code:'error',
            message:"Công việc không tồn tại"
        })
    }
    req.body.salaryMin=req.body.salaryMin ? parseInt(req.body.salaryMin):0;
    req.body.salaryMax=req.body.salaryMax ? parseInt(req.body.salaryMax):0;
    req.body.technologies=req.body.technologies ? req.body.technologies.split(", "):[];
    if(req.files)
    {
        for(const file of req.files as any)
        {
            req.body.images.push(file.path);
        }
    }
    await Job.updateOne({
        _id:id
    },req.body);
    res.json({
        code:'success',
        message:'Cập nhật thành công'
    })
}