//--> My Modules:
import vProduct from "./../Models/productModel.js";
import CatchAsync from "../Utilities/CatchAsync.js";
import slugify from "slugify";
//--> Built-In Modules:
//--> Third-Party Modules:

export const postProduct = CatchAsync(async (vReq, vRes, vNext) => {
  const productName = vReq.body.vProductName;
  const vNewProduct = await vProduct.create({
    vManufacturerName: vReq.body.vManufacturerName,
    vProductName: vReq.body.vProductName,
    vFrontImage: vReq.body.vFrontImage,
    vBackImage: vReq.body.vBackImage,
    vPrice: vReq.body.vPrice,
    vQunatity: vReq.body.vQunatity,
    vUnit: vReq.body.vUnit,
    vSellerName: vReq.body.vSellerName,
    vCountryOfOrigin: vReq.body.vCountryOfOrigin,
    vShelfLife: vReq.body.vShelfLife,
  });
  vRes.status(201).json({
    vStatus: "Success",
    vData: `${productName} Is Created Successfully`,
  });
});

export const getAllProduct = CatchAsync(async (vReq, vRes, vNext) => {
  let vQuery = vProduct.find();
  const products = await vQuery;
  vRes.status(200).json({
    success: "true",
    products,
  });
});

export const getOneProduct = CatchAsync(async (vReq, vRes, vNext) => {
  let vQuery = vProduct.findById(vReq.params.vID);
  const vDocument = await vQuery;
  vRes.status(200).json({
    vStatus: "Success",
    vData: vDocument,
  });
});

export const patchProduct = CatchAsync(async (vReq, vRes, vNext) => {
  const vDocument = await vProduct.findByIdAndUpdate(
    vReq.params.vID,
    vReq.body,
    {
      new: true,
      runValidators: true,
    }
  );
  vRes.status(200).json({
    vStatus: "Success",
    vData: vDocument,
  });
});

export const deleteProduct = CatchAsync(async (vReq, vRes, vNext) => {
  const vDocument = await vProduct.findByIdAndDelete(vReq.params.vID);
  vRes.status(204).json({
    vStatus: "Success",
    vData: null,
  });
});
