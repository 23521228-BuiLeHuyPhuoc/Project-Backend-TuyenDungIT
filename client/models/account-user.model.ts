import mongoose from "mongoose";
const schema = new mongoose.Schema({
    fullName: String,
    email: {
        type: String,
        unique: true
    },
    password: String
},{
    timestamps: true
}
);
const AccountUser = mongoose.model("Account-User",schema,"account-user");
export default AccountUser;