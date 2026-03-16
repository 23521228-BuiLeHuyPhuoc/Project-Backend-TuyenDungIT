import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.DATABASE}`);
        console.log("Kết nối MongoDB thành công!");
    }
    catch (error) {
        console.error("Lỗi kết nối MongoDB:", error);
    }
}