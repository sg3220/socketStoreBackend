import express from "express";
import * as authController from "./../Controllers/authController.js";
const uRouter = express.Router();
uRouter.post("/SignUp", authController.SignUp);
uRouter.get("/KnowMe", authController.Protect, authController.KnowMe);
uRouter.post("/LogIn", authController.LogIn);
uRouter.get("/LogOut", authController.LogOut);
uRouter.post("/ForgotPassword", authController.ForgotPassword);
uRouter.patch("/ResetPassword/:vToken", authController.ResetPassword);
uRouter.use(authController.Protect);
uRouter.patch("/UpdatePassword", authController.UpdatePassword);

export default uRouter;
