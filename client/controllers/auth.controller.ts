import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import AccountUser from "../models/account-user.model";

export const checkLogin = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if(!token) {
      res.json({
        code: "error",
        message: "Token không hợp lệ!"
      });
      return;
    }

    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload; // Giải mã token
    const { id, email } = decoded;

    // Tìm user
    const existAccountUser = await AccountUser.findOne({
      _id: id,
      email: email
    });
    if(!existAccountUser){
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ!"
      });
      return;
    }
    if(existAccountUser) {
      const infoUser = {
        id: existAccountUser.id,
        fullName: existAccountUser.fullName,
        email: existAccountUser.email,
      };

      res.json({
        code: "success",
        message: "Token hợp lệ!",
        infoUser: infoUser
      });
      return;
    }


  

  } catch (error) {
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Token không hợp lệ!"
    });
  }
}

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({
    code: "success",
    message: "Đã đăng xuất!"
  });
}
