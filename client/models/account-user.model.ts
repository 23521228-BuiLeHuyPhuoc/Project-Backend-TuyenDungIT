import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    avatar: String,
    phone: String
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const AccountUser = mongoose.model('Account-User', schema, "account-user");

export default AccountUser;