import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
export const detail=async(req:Request,res:Response)=>{
   
   try{
    const id=req.params.slug;
    const record =await Job.findOne({
        _id:id
    })
    if(!record){
        res.json({
            code:"error",
            message:"Không tìm thấy công việc!"
        })
        return;
    }
    const jobDetail={
        id:record.id,
        title:record.title,
        companyId:record.companyId,
        companyname:"",
        companyLogo:"",
        companyModel:"",
        companyEmployees:"",
        companyWorkingTime:"",
        companyWorkOverTime:"",
        workingTime:"",
        salaryMin:record.salaryMin,
        salaryMax:record.salaryMax,
        description:record.description,
        images:record.images,
        position:record.position,
        workingForm:record.workingForm,
        companyAddress:"",
        technologies:record.technologies
    }
    const companyInfo=await AccountCompany.findOne({
        _id:record.companyId
    })
    if(companyInfo){
        jobDetail.companyname=`${companyInfo.companyName}`;
        jobDetail.companyLogo=`${companyInfo.logo}`;
        jobDetail.companyModel=`${companyInfo.companyModel}`;
        jobDetail.companyEmployees=`${companyInfo.companyEmployees}`;
        jobDetail.workingTime=`${companyInfo.workingTime}`;
        jobDetail.companyWorkingTime=`${companyInfo.workingTime}`;
        jobDetail.companyWorkOverTime=`${companyInfo.workOvertime}`;
        jobDetail.companyAddress=`${companyInfo.address}`;
    }

     res.json({
        code:"success",
        message:"Thành công!",
        jobDetail:jobDetail
    })




   }
   catch(error){
    res.json({
        code:"error",
        message:"Có lỗi xảy ra!"
    })
   }
   
   
   
   
   
   
}