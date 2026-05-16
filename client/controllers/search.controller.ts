import { Request, Response } from "express";
import Job from "../models/job.model";
import City from "../models/city.model";
import AccountCompany from "../models/account-company.model";
export const search=async(req:Request,res:Response)=>{
    const dataFinal = [];
    let totalPage = 0;
    let totalRecord = 0;

    if(Object.keys(req.query).length>0)
    {
        const find:any={};
        if(req.query.language)
        {
            // Technologies là array, nên dùng $in để match
            find.technologies={$in:[req.query.language]};
        }
        if(req.query.city) {
      const city = await City.findOne({
        name: req.query.city
      })

      if(city) {
        const listAccountCompanyInCity = await AccountCompany.find({
          city: city.id
        })

        const listIdAccountCompany = listAccountCompanyInCity.map(item => item.id);

        find.companyId = { $in: listIdAccountCompany };
      }
      else{
        find.companyId=null;
      }
    }
    if(req.query.company){
        const company=await AccountCompany.findOne({
            companyName:req.query.company
        })
        if(company){
            find.companyId=company.id;
        }
    }
    if(req.query.keyword){
        const keywordRegex=new RegExp(`${req.query.keyword}`,"i");
       find["$or"]=[
        {
            title:keywordRegex
        },
        {
            technologies:keywordRegex
        }
       ]
    }
    if(req.query.position)
    {
        find.position=req.query.position;
    }
    if(req.query.workingForm)
    {
        find.workingForm=req.query.workingForm;
    }
    // Phân trang
    const limitItems = 2;
    let page = 1;
    if(req.query.page) {
      const currentPage = parseInt(`${req.query.page}`);
      if(currentPage > 0) {
        page = currentPage;
      }
    }
    totalRecord = await Job.countDocuments(find);
    totalPage = Math.ceil(totalRecord/limitItems);
    if(page > totalPage && totalPage != 0) {
      page = totalPage;
    }
    const skip = (page - 1) * limitItems;
    // Hết Phân trang

    
    let job:any=[];
    if(find)
    {
    job=await Job.find(find).sort({
        createdAt:"desc"
    }).limit(limitItems).skip(skip);
}
else{
    return res.json({
        code:"error",
        message:"Vui lòng nhập tham số tìm kiếm"
    })
}

    for(const item of job)
    {
        const itemFinal: any = {
            id:item.id,
            companyLogo:"",
            title:item.title,
            companyName:"",
            salaryMin:item.salaryMin,
            salaryMax:item.salaryMax,
            position:item.position,
            workingForm:item.workingForm,
            companyCity:"",
            technologies:item.technologies
        };
        const companyInfo=await AccountCompany.findOne({
            _id:item.companyId
        });
        if(companyInfo){
            itemFinal.companyLogo=`${companyInfo.logo}`;
            itemFinal.companyName=`${companyInfo.companyName}`;
            const cityInfo=await City.findOne({ 
                _id:companyInfo.city
            });
            if(cityInfo){
                itemFinal.companyCity=`${cityInfo.name}`;
            }
        }

        dataFinal.push(itemFinal);
    }
    res.json({
        code:'success',
        message:'Thành công',
        jobs:dataFinal,
        totalPage:totalPage,
        totalRecord:totalRecord
    })
    } else {
        res.json({
            code:'error',
            message:'Vui lòng nhập tham số tìm kiếm',
            jobs:[]
        })
    }
}