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
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
const productList = [
  {
    vProductName: "Cookies Heaven Atta",
    vPrice: 70,
    vProductImage: "dcfghb",
    id: "64c23b33ac02c2340caebfdd",
  },
  {
    vProductName: "Cookiesen Atta",
    vPrice: 70,
    vProductImage: "cfgtbhnjvbn",
    id: "64c23b33ac02c2340caebfde",
  },
];
App.use("/Bittu", (req, res) => [res.send(productList)]);
//^ 👇It Is Required To Access The Body
App.use(express.json());
App.use("/API/V1/Users", userRouter);
App.use("/API/V1/Products", productRouter);
