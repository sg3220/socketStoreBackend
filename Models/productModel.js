//--> My Modules:
//--> Built-In Modules:
//--> Third-Party Modules:
import mongoose from "mongoose";
import slugify from "slugify";
import validator from "validator";
const vProductSchema = new mongoose.Schema({
  vManufacturerName: {
    type: String,
    required: [true, "❗vManufacturerName: Is Required Field"],
    trim: true,
  },
  vProductName: {
    type: String,
    required: [true, "❗vProductName: Is Required Field"],
    trim: true,
    unique: true,
  },
  vSlug: String,
  vFrontImage: String,
  // required: [true, "❗ vFrontImage: Is Required Field"],

  vBackImage: String,
  vPrice: {
    type: Number,
    required: [true, "❗vPrice: Is Required Field"],
  },
  vDiscountPercentage: {
    type: Number,
    validate: {
      validator: function (vElement) {
        return vElement < 100;
      },
      message: "❗vDiscountPercentage Should Be <= 99",
    },
  },
  vQunatity: {
    type: Number,
    required: [true, "❗vQuantity: Is Required Field"],
  },
  vUnit: {
    type: String,
    required: [true, "❗ vUnit: Is Required Field"],
    enum: ["g", "Kg", "mL", "L"],
    default: "g",
  },
  vSellerName: {
    type: String,
    required: [true, "❗vSellerName: Is Required Field"],
  },
  vCountryOfOrigin: {
    type: String,
    required: [true, "❗vCountryOfOrigin: Is Required Field"],
  },
  vShelfLife: {
    type: Number,
    required: [true, "❗ vShelfLife: Is Required Field"],
  },
  vDate: {
    type: Date,
    default: Date.now(),
  },
  vImportantInformation: String,
});

vProductSchema.pre("save", function (vNext) {
  const stockInDate = this.vDate.getTime();
  const stockExpiryDate = stockInDate + this.vShelfLife * 24 * 60 * 60 * 1000;
  const Today = Date.now();
  const calculating = ((stockExpiryDate - stockInDate) / stockExpiryDate) * 100;
  if (calculating > 0) {
    this.vDiscountPercentage = calculating;
  } else {
    this.vDiscountPercentage = 99;
  }

  vNext();
});

vProductSchema.pre("save", function (vNext) {
  this.vSlug = slugify(this.vProductName, { lower: true });
  vNext();
});

vProductSchema.pre("save", function (vNext) {
  this.vImportantInformation = `Seller Name: ${this.vSellerName}, Country Of Origin: ${this.vCountryOfOrigin}, The Shelf Life Of The Product Is: ${this.vShelfLife} Days, From The Date Of Manufacture/Packed By.`;
  vNext();
});

const vProduct = mongoose.model("vProduct", vProductSchema);
export default vProduct;
