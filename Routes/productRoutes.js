import express from "express";
import * as productController from "./../Controllers/productController.js";
import * as authController from "./../Controllers/authController.js";
const pRouter = express.Router();
pRouter.route("/").get(productController.getAllProduct);
pRouter.route("/:vID").get(productController.getOneProduct);
pRouter
  .route("/:vID")
  .get(productController.getOneProduct)
  .patch(
    authController.Protect,
    authController.restrictTo("vAdministrator"),
    productController.patchProduct
  )
  .delete(
    authController.Protect,
    authController.restrictTo("vAdministrator"),
    productController.deleteProduct
  );
pRouter
  .route("/PostProduct")
  .post(
    authController.Protect,
    authController.restrictTo("vAdministrator"),
    productController.postProduct
  );
export default pRouter;
