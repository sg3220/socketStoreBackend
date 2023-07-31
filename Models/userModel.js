//--> My Modules:
//--> Built-In Modules:
//--> Third-Party Modules:
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const vUserSchema = new mongoose.Schema({
  vName: {
    type: String,
    required: [true, "❗vName: Is Required Field"],
  },
  vEmail: {
    type: String,
    required: [true, "❗vEmail: Is Required Field"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "❗vEmail: Is Not Valid"],
  },
  vPassword: {
    type: String,
    required: [true, "❗vPassword: Is Required Field"],
    select: false,
  },
  vPasswordConfirm: {
    type: String,
    required: [true, "❗vPasswordConfirm: Is Required Field"],
    validate: {
      validator: function (vElement) {
        return vElement === this.vPassword;
      },
      message: "❗vPassword & vPasswordConfirm Not Match",
    },
  },
  vAvatar: {
    type: String,
    default: "AvatarDefault.png",
  },
  vRole: {
    type: String,
    enum: ["vClient", "vAdministrator"],
    default: "vClient",
  },
  vActiveStatus: {
    type: Boolean,
    default: true,
    select: false,
  },
  vPasswordChangedAt: Date,
  vPasswordResetToken: String,
  vPasswordResetExpires: Date,
});

vUserSchema.pre("save", async function (vNext) {
  if (!this.isModified("vPassword")) {
    return vNext();
  }
  this.vPassword = await bcrypt.hash(this.vPassword, 12);
  this.vPasswordConfirm = undefined;
  vNext();
});

vUserSchema.pre("save", function (vNext) {
  if (!this.isModified("vPassword") || this.isNew) {
    return vNext();
  }
  this.vPasswordChangedAt = Date.now() - 1000;
  vNext();
});

vUserSchema.methods.vChangedPasswordAfter = function (vDecodedJWTTimeStamp) {
  if (this.vPasswordChangedAt) {
    const vPasswordChangedAtCalculated = parseInt(
      this.vPasswordChangedAt.getTime() / 1000,
      10
    );
    return vDecodedJWTTimeStamp < vPasswordChangedAtCalculated;
  }
  return false;
};

vUserSchema.methods.vCreatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.vPasswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(resetToken, this.vPasswordResetToken);
  this.vPasswordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

vUserSchema.methods.vCorrectPassword = async function (pass01, pass02) {
  return await bcrypt.compare(pass01, pass02);
};

const vUser = mongoose.model("vUser", vUserSchema);
export default vUser;
