import { App } from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ path: "./Data/Configuration.env" });

const databaseLink = process.env.DATABASE;
mongoose
  .connect(databaseLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("❕Database Connection Successful!!!");
  });
// console.log(process.env.FRONTEND_URL);
const vPortNumber = process.env.PORT || 4000;
const Server = App.listen(vPortNumber, () => {
  console.log(
    `❕App Running On PortNumber: ${vPortNumber} in ${process.env.NODE_ENV}`
  );
});
