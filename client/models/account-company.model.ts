import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    companyName: String,
    email: {
      type: String,
      unique: true
    },
    password: String
  },
  {
    timestamps: true
  }
);

const AccountCompany = mongoose.model('AccountCompany', schema, "accounts-company");

export default AccountCompany;