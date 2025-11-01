import express , {Request, Response }from 'express';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes';
dotenv.config();


const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/user',userRouter);

app.use('/health', ( req : Request , res : Response) => {
  res.status(200).json({
    status : 'OK'
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
