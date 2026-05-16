import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AccountCompany from '../models/account-company.model';
import { AccountRequest } from '../../interfaces/request.interface';
import Job from '../models/job.model';
import City from '../models/city.model';
import CV from '../models/cv.model';
export const registerPost = async (req: Request, res: Response) => {
    const { companyName, email, password } = req.body;
    const existAccount = await AccountCompany.findOne({ email });
    if (existAccount) {
        return res.json({
            message: 'Email đã tồn tại!',
            code: 'error'
        })
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newAccount = new AccountCompany({
        companyName: companyName,
        email: email,
        password: hashPassword
    })
    await newAccount.save();
    console.log(req.body);
    res.json({
        message: 'Đăng ký thành công!',
        code: 'success'
    })
}
export const loginPost = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existAccount = await AccountCompany.findOne({
        email: email
    })
    if (!existAccount) {
        return res.json({
            code: 'error',
            message: "Email không tồn tại"
        })
    }
    const isMatch = await bcrypt.compare(password, `${existAccount.password}`);
    if (!isMatch) {
        return res.json({
            code: 'error',
            message: "Mật khẩu không chính xác"
        })
    }
    const token = jwt.sign({
        id: existAccount._id,
        email: existAccount.email
    },
        `${process.env.JWT_SECRET}`,
        { expiresIn: '1d' });
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
        secure: process.env.NODE_ENV === 'production'
    })
    res.json({
        code: 'success',
        message: 'Đăng nhập thành công'
    })
}
export const profilePatch = async (req: AccountRequest, res: Response) => {
    if (req.file) {
        req.body.logo = req.file.path;
    }
    else {
        delete req.body.logo;
    }
    const existAccount = await AccountCompany.findOne({
        _id: req.company.id
    })
    if (!existAccount) {
        return res.json({
            code: 'error',
            message: "Email không tồn tại"
        })
    }
    await AccountCompany.updateOne({
        _id: req.company.id
    }, req.body);
    res.json({
        code: 'success',
        message: 'Cập nhật thành công'
    })
}
export const createJobPost = async (req: AccountRequest, res: Response) => {
    req.body.companyId = req.company.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.position = req.body.position ? req.body.position : '';
    req.body.workingForm = req.body.workingForm ? req.body.workingForm : '';

    req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : [];
    req.body.images = [];
    if (req.files) {
        for (const file of req.files as any) {
            req.body.images.push(file.path);
        }
    }

    const newJob = new Job(req.body);
    await newJob.save();




    res.json({
        code: "success",
        message: "Tạo mới công việc thành công"
    })
}
export const getListJobPost = async (req: AccountRequest, res: Response) => {
    const find = {
        companyId: req.company.id
    };
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
    const skip = (page - 1) * limit;
    const totalRecord = await Job.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limit);

    const jobs = await Job.find(find).sort({
        createdAt: "desc"
    }).skip(skip).limit(limit);
    const city = await City.findOne({
        _id: req.company.city
    })
    const dataFinal = [];
    for (const item of jobs) {
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
        code: "success",
        jobs: dataFinal,
        totalPage: totalPage
    })
}
export const getDetailJob = async (req: AccountRequest, res: Response) => {
    const { id } = req.params;
    const existJob = await Job.findOne({
        _id: id,
        companyId: req.company.id
    })
    if (!existJob) {
        return res.json({
            code: 'error',
            message: "Công việc không tồn tại"
        })
    }
    res.json({
        code: "success",
        jobDetail: existJob
    })
}
export const editJobPatch = async (req: AccountRequest, res: Response) => {
    const { id } = req.params;
    const existJob = await Job.findOne({
        _id: id,
        companyId: req.company.id
    })
    if (!existJob) {
        return res.json({
            code: 'error',
            message: "Công việc không tồn tại"
        })
    }
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : [];
    if (req.files) {
        for (const file of req.files as any) {
            req.body.images.push(file.path);
        }
    }
    await Job.updateOne({
        _id: id
    }, req.body);
    res.json({
        code: 'success',
        message: 'Cập nhật thành công'
    })
}
export const deleteJobPost = async (req: AccountRequest, res: Response) => {
    const { id } = req.params;
    const existJob = await Job.findOne({
        _id: id,
        companyId: req.company.id
    })
    if (!existJob) {
        return res.json({
            code: 'error',
            message: "Công việc không tồn tại"
        })
    }
    await Job.deleteOne({
        _id: id
    });
    res.json({
        code: 'success',
        message: 'Xóa thành công'
    })
}
export const list = async (req: Request, res: Response) => {
    try {

        let limitItems = 2;
        if (req.query.limitItems) {
            limitItems = parseInt(`${req.query.limitItems}`);
        }
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const skip = (page - 1) * limitItems;
        const totalRecord = await AccountCompany.countDocuments({});
        const totalPage = Math.ceil(totalRecord / limitItems);

        const companyList = await AccountCompany
            .find({})
            .limit(limitItems)
            .skip(skip)
            .sort({
                createdAt: "desc"
            });

        const companyListFinal = [];

        for (const item of companyList) {
            const dataItemFinal = {
                id: item.id,
                logo: item.logo,
                companyName: item.companyName,
                cityName: "",
                totalJob: 0
            };

            // Thành phố
            const city = await City.findOne({
                _id: item.city
            })
            dataItemFinal.cityName = `${city?.name}`;

            // Tổng số việc làm
            const totalJob = await Job.countDocuments({
                companyId: item.id
            })
            dataItemFinal.totalJob = totalJob;

            companyListFinal.push(dataItemFinal);
        }
        console.log(companyListFinal);
        res.json({
            code: "success",
            message: "Thành công!",
            companyList: companyListFinal,
            totalPage: totalPage
        })
    }
    catch (error) {
        console.log("LỖI:", error);
        res.json({ code: 'error', message: error });
    }
}
export const detail = async (req: AccountRequest, res: Response) => {
    try {
        const id = req.params.id;
        const record = await AccountCompany.findOne({
            _id: id
        })
        if (!record) {
            return res.json({
                code: 'error',
                message: 'Công ty không tồn tại'
            })
        }
        const companyDetail = {
            id: record.id,
            logo: record.logo,
            companyName: record.companyName,
            address: record.address,
            workingTime: record.workingTime,
            workOvertime: record.workOvertime,
            companyEmployees: record.companyEmployees,
            companyModel: record.companyModel,
            description: record.description
        }
        const dataFinal = [];
        const jobs = await Job.find({
            companyId: id
        });
        const city = await City.findOne({
            _id: record.city
        })
        for (const item of jobs) {

            dataFinal.push({
                id: item.id,
                companyLogo: record.logo,
                title: item.title,
                companyName: record.companyName,
                salaryMin: item.salaryMin,
                salaryMax: item.salaryMax,
                position: item.position,
                workingForm: item.workingForm,
                technologies: item.technologies,
                companyCity: city?.name
            })
        }

        res.json({
            code: "success",
            message: "thành công!",
            companyDetail: companyDetail,
            jobList: dataFinal
        })
    }
    catch (error) {
        res.json({
            code: "error",
            message: "ID không hợp lệ"
        })
    }
}
export const listCV = async (req: AccountRequest, res: Response) => {
    const companyId = req.company.id;
    const listJob = await Job.find({
        companyId: companyId
    });
    const listJobId = listJob.map(item => item.id);
    const listCV = await CV.find({
        jobId: { $in: listJobId }
    }).sort({
        createdAt: "desc"
    });
    const dataFinal = [];
    for (const item of listCV) {
        const dataItemFinal = {
            id: item.id,
            jobTitle: "",
            fullName: item.fullName,
            email: item.email,
            phone: item.phone,
            jobSalaryMin: 0,
            jobSalaryMax: 0,
            jobWorkingForm: "",
            jobPosition: "",
            viewed: item.viewed,
            status: item.status
        }
        const infoJob = await Job.findOne({
            _id: item.jobId
        });
        if (infoJob) {

            dataItemFinal.jobTitle = `${infoJob.title}`;
            dataItemFinal.jobSalaryMin = parseInt(`${infoJob.salaryMin}`);
            dataItemFinal.jobSalaryMax = parseInt(`${infoJob.salaryMax}`);
            dataItemFinal.jobWorkingForm = `${infoJob.workingForm}`;
            dataItemFinal.jobPosition = `${infoJob.position}`;
            dataFinal.push(dataItemFinal);
        }
    }

    res.json({
        code: "success",
        message: "Lấy danh sách CV thành công!",
        listCV: dataFinal
    })

}
export const detailCV = async (req: AccountRequest, res: Response) => {
    try {
        const companyId = req.company.id;
        const cvId = req.params.id;
        const infoCV = await CV.findOne({
            _id: cvId,
        })
        if (!infoCV) {
            res.json({
                code: "error",
                message: "CV không tồn tại"
            })
            return;
        }
        const infoJob = await Job.findOne({
            _id: infoCV.jobId,
            companyId: companyId
        })
        if (!infoJob) {
            res.json({
                code: "error",
                message: "CV không tồn tại"
            })
            return;
        }
        const dataFinalCV = {
            fullName: infoCV.fullName,
            email: infoCV.email,
            phone: infoCV.phone,
            fileCV: infoCV.fileCV,

        };
        const dataFinalJob = {
            id: infoJob.id,
            title: infoJob.title,
            salaryMin: infoJob.salaryMin,
            salaryMax: infoJob.salaryMax,
            position: infoJob.position,
            workingForm: infoJob.workingForm,
            technologies: infoJob.technologies

        };
        await CV.updateOne({
            _id: cvId
        }, {
            viewed: true
        });
        res.json({
            code: "success",
            message: "Lấy CV thành công!",
            infoCV: dataFinalCV,
            infoJob: dataFinalJob,

        })
    }
    catch (error) {
        res.json({
            code: "error",
            message: "ID không hợp lệ"
        })
    }

}
export const changeStatusCVPatch = async (req: AccountRequest, res: Response) => {
    try {
        const companyId = req.company.id;
        const action = req.body.action;
        const id = req.body.id;
        const infoCV = await CV.findOne({
            _id: id,
        })
        if (!infoCV) {
            res.json({
                code: "error",
                message: "CV không tồn tại"
            })
            return;
        }
        const infoJob = await Job.findOne({
            _id: infoCV.jobId,
            companyId: companyId
        })
        if (!infoJob) {
            res.json({
                code: "error",
                message: "CV không tồn tại"
            })
            return;
        }

        await CV.updateOne({
            _id: id

        }, {
            status: action
        })

        res.json({
            code: "success",
            message: "Thành công!"
        })
    }
    catch (error) {
        console.log("LỖI", error);
        res.json({
            code: "error",
            message: error
        })
    }
}
export const deleteCVPatch = async (req: AccountRequest, res: Response) => {
    try {
        const id = req.params.id;
        const companyId = req.company.id;
        const infoCV = await CV.findOne({
            _id: id,
        })
        if (!infoCV) {
            res.json({
                code: "error",
                message: "CV không tồn tại"
            })
            return;
        }
        const infoJob = await Job.findOne({
            _id: infoCV.jobId,
            companyId: companyId
        })
        if (!infoJob) {
            res.json({
                code: "error",
                message: "CV không tồn tại"
            })
            return;
        }
        await CV.deleteOne({
            _id: id
        });
        res.json({
            code: "success",
            message: "Xoá CV thành công!"
        })
    }
    catch (error) {
        console.log("LỖI", error);
        res.json({
            code: "error",
            message: error
        })
    }
}