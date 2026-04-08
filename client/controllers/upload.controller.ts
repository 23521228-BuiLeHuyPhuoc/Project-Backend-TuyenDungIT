import { Request, Response } from "express";

export const imagePost = async (req: Request, res: Response) => {
   
    
    return res.json({
        code:'success',
        message:"Upload ảnh thành công",
        location:req.file?.path
    })
}