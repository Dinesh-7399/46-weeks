import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if(!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not defined");
    }
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1); // Exit the process with an error code
  }
}