import mongoose from "mongoose";

const mongodbURI = process.env.DB_URI as string;
const mongodbName = process.env.DB_NAME as string;

if (!mongodbURI) {
  throw new Error("DB_URI is not defined");
}
if (!mongodbName) {
  throw new Error("DB_NAME is not defined");
}

export default async function connectDB() {
  try {
    await mongoose.connect(mongodbURI, { dbName: mongodbName });
    console.log("Connected to mongoDB");
  } catch (error) {
    console.log(error);
  }
}
