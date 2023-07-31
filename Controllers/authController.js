//--> My Modules:
import vUser from "./../Models/userModel.js";
import CatchAsync from "./../Utilities/CatchAsync.js";
import AppError from "./../Utilities/AppError.js";
import vSendEmail from "./../Utilities/Email.js";
import dotenv from "dotenv";
//--> Built-In Modules:
//--> Third-Party Modules:
import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";
import os from "os";
//*
//*
//*
//*

//*
//*
//*
//*
//* vCreateSendToken
const vCreateSendToken = (vUser, statusCode, vMessage, vRes) => {
  const token = jwt.sign({ _id: vUser._id }, process.env.JWT_SECRET);
  vRes
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Development" ? false : true,
    })
    .json({
      vStatus: "Success",
      vMessage,
    });
};
//*
//*
//*
//*
//* SIGN-UP
export const SignUp = CatchAsync(async (vReq, vRes, vNext) => {
  const vNewUser = await vUser.create({
    vName: vReq.body.vName,
    vEmail: vReq.body.vEmail,
    vPassword: vReq.body.vPassword,
    vPasswordConfirm: vReq.body.vPasswordConfirm,
  });
  vCreateSendToken(vNewUser, 201, "SignUp Successful", vRes);
  try {
    await vSendEmail({
      vClientEmail: vReq.body.vEmail,
      vSubject: "⭐Your VIP Access Is Here⭐",
      vvMessage: `👋, ${
        vReq.body.vName.split(" ")[0]
      }, We're thrilled to welcome you aboard! Your trust in us means the world. Expect exceptional service, tailored solutions, and a rewarding journey ahead. Thank you for choosing us as your partner. We can't wait to create magic together!\n
      Team Socket()`,
    });
    vRes.status(200).json({
      vStatus: "Success",
    });
  } catch (vError) {
    return vNext(
      new AppError("There Was An Error Sending The Email. Try Again Later", 500)
    );
  }
});
//*
//*
//*
//*
//* LOGIN
export const LogIn = CatchAsync(async (vReq, vRes, vNext) => {
  const vIPAddress = vReq.connection.remoteAddress.replace("::ffff", "");
  let temporaryUser;
  const { vEmail, vPassword } = vReq.body;
  if (!vEmail || !vPassword) {
    return vNext(new AppError("❗Please Provide Email & Password", 400));
  }
  temporaryUser = await vUser
    .findOne({ vEmail })
    .select("vPassword")
    .select("vName");

  if (
    !temporaryUser ||
    !(await temporaryUser.vCorrectPassword(vPassword, temporaryUser.vPassword))
  ) {
    return vNext(new AppError("❗Incorrect Email OR Password", 401));
  }
  vCreateSendToken(temporaryUser, 200, "LogIn Successful", vRes);
  try {
    await vSendEmail({
      vClientEmail: vReq.body.vEmail,
      vSubject: "🛡️ Login Alert",
      vvMessage: `👋, ${temporaryUser.vName.split(" ")[0]},
      We detected an login attempt on your account from IPAdress${vIPAddress} OS: ${os.platform()}As part of our security measures, we're alerting you to this activity. If this wasn't you, please contact our support team immediately.
      Team Socket()`,
    });
    vRes.status(200).json({
      vStatus: "Success",
    });
  } catch (vError) {
    return vNext(
      new AppError("There Was An Error Sending The Email. Try Again Later", 500)
    );
  }
});
//*
//*
//*
//*
//* LOGOUT
export const LogOut = (vReq, vRes) => {
  vRes
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Development" ? false : true,
    })
    .json({ vStatus: "Success" });
};
//*
//*
//*
//*
//* PROTECT
export const Protect = CatchAsync(async (vReq, vRes, vNext) => {
  const { token } = vReq.cookies;
  const temporaryToken = token;
  if (!temporaryToken) {
    return vNext(new AppError("❗Please LogIn To Get Access", 401));
  }
  const vDecoded = jwt.verify(temporaryToken, process.env.JWT_SECRET);
  const currentUser = await vUser.findById(vDecoded._id);
  if (!currentUser) {
    return vNext(new AppError("❗Token-User Mismatch", 401));
  }
  if (currentUser.vChangedPasswordAfter(vDecoded.iat)) {
    return vNext(
      new AppError("❗Password Changed Recently...LogIn Again", 401)
    );
  }
  vReq.vUser = currentUser;
  vRes.locals.vUser = currentUser;
  vNext();
});
export const KnowMe = (vReq, vRes) => {
  vRes.status(200).json({
    vMessage: "Success",
    user: vReq.vUser,
  });
};
//*
//*
//*
//*
//* IS-RESTRICT-TO
export const restrictTo = (...vRoles) => {
  return (vReq, vRes, vNext) => {
    console.log(vReq.vUser);
    if (!vRoles.includes(vReq.vUser.vRole)) {
      return vNext(
        new AppError("❗You Do Not Have Permission To Perform This Action", 403)
      );
    }
    vNext();
  };
};
//*
//*
//*
//*
//* FORGOT-PASSWORD
export const ForgotPassword = CatchAsync(async (vReq, vRes, vNext) => {
  const temporaryUser = await vUser.findOne({ vEmail: vReq.body.vEmail });
  if (!temporaryUser) {
    return vNext(
      new AppError("❗There Is No User With That Email Address", 404)
    );
  }
  const vResetToken = temporaryUser.vCreatePasswordResetToken();
  await temporaryUser.save({ validateBeforeSave: true });
  const vResetURL = `${vReq.protocol}://${vReq.get(
    "host"
  )}/API/V1/Users/ResetPassword/${vResetToken}`;
  const vvMessage = `Forgot Your Password?\nSubmit A PATCH Request With Your\nnewPassword & newPasswordConfirm to\n${vResetURL}\n`;
  try {
    await vSendEmail({
      vClientEmail: temporaryUser.vEmail,
      vSubject: "Your Password Reset Link Is Valid Only For 10 Minutes",
      vvMessage,
    });
    vRes.status(200).json({
      vStatus: "Success",
      vMessage: "Token Sent To Your Email",
    });
  } catch (vError) {
    temporaryUser.vPasswordResetToken = undefined;
    temporaryUser.vPasswordResetExpires = undefined;
    await temporaryUser.save({ validateBeforeSave: false });
    return vNext(
      new AppError("There Was An Error Sending The Email. Try Again Later", 500)
    );
  }
});
//*
//*
//*
//*
//* RESET-PASSWORD
export const ResetPassword = CatchAsync(async (vReq, vRes, vNext) => {
  console.log(vReq.params.vToken);
  const vHashedToken = crypto
    .createHash("sha256")
    .update(vReq.params.vToken)
    .digest("hex");
  console.log(vHashedToken);

  const temporaryUser = await vUser.findOne({
    vPasswordResetToken: vHashedToken,
    vPasswordResetExpires: { $gt: Date.now() },
  });
  console.log(temporaryUser);
  if (!temporaryUser) {
    return vNext(new AppError("Token Is Invalid Or Has Expired", 400));
  }
  temporaryUser.vPassword = vReq.body.vPassword;
  temporaryUser.vPasswordConfirm = vReq.body.vPasswordConfirm;
  temporaryUser.vPasswordResetToken = undefined;
  temporaryUser.vPasswordResetExpires = undefined;
  console.log(temporaryUser.vPassword, temporaryUser.vPasswordConfirm);

  await temporaryUser.save();
  vCreateSendToken(temporaryUser, 200, vRes);
});
//*
//*
//*
//*
//* UPDATE-PASSWORD
export const UpdatePassword = CatchAsync(async (vReq, vRes, vNext) => {
  let temporaryToken;
  if (
    vReq.headers.authorization &&
    vReq.headers.authorization.startsWith("Bearer")
  ) {
    temporaryToken = vReq.headers.authorization.split(" ")[1];
  } else if (vReq.cookies.jwt) {
    temporaryToken = vReq.cookies.jwt;
  }
  if (!temporaryToken) {
    return vNext(new AppError("❗Please LogIn To Get Access", 401));
  }
  const vDecoded = await promisify(jwt.verify)(
    temporaryToken,
    process.env.JWT_SECRET
  );
  const temporaryUser = await vUser.findById(vDecoded.id).select("+vPassword");
  if (
    !(await temporaryUser.vCorrectPassword(
      vReq.body.vCurrentPassword,
      temporaryUser.vPassword
    ))
  ) {
    return vNext(new AppError("Your Current Password Is Wrong", 401));
  }
  temporaryUser.vPassword = vReq.body.vNewPassword;
  temporaryUser.vPasswordConfirm = vReq.body.vNewPasswordConfirm;
  await temporaryUser.save();

  vCreateSendToken(temporaryUser, 200, vRes);
});
