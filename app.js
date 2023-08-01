import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./Data/Configuration.env" });
import homeRouter from "./Routes/homeRouter.js";
import userRouter from "./Routes/userRoutes.js";
import productRouter from "./Routes/productRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
export const App = express();
App.use(cookieParser());
App.use(
  "*",
  cors({
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
App.get("/", (req, res) => res.send("Socket Server Running"));
//^ 👇It Is Required To Access The Body
App.use(express.json());
App.use("/API/V1/Users", userRouter);
App.use("/API/V1/Products", productRouter);
