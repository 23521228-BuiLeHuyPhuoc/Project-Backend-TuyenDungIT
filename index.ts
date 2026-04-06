import express from 'express';
import cors from 'cors';
import routerClient from './client/routes/index.route';
import * as userController from './client/controllers/user.controller';
import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database';
import cookieParser from 'cookie-parser';

const app = express();
const port = 4000;
connectDB();
app.use(cors({
    origin: "http://localhost:3000",
    methods:["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization"],
    credentials:true
}));
app.use(express.json());

app.use(cookieParser());

app.use('/', routerClient);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
