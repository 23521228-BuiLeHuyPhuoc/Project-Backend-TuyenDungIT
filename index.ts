import express from 'express';
import cors from 'cors';
import routerClient from './client/routes/index.route';
import * as userController from './client/controllers/user.controller';
import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database';

const app = express();
const port = 4000;
connectDB();
app.use(cors({
    origin: "http://localhost:3000",
    methods:["GET", "POST", "PUT", "DELETE"],
    allowedHeaders:["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use('/', routerClient);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
