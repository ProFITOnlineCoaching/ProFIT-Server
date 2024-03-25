import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { dbConnection } from "./DB/dbConnection.js";
import { globalErrorHandling } from "./src/middlewares/GlobalErrorHandling.js";
import { AppError } from "./src/utils/AppError.js";

import cors from 'cors';
import traineeAuthRouter from './src/modules/TraineeMobile/Auth/auth.routes.js';
import trainerAuthRoutes from "./src/modules/TrainerDashboard/Auth/auth.routes.js";
import adminAuthRoutes from "./src/modules/AdminDashboard/Auth/auth.routes.js";
import adminControllerRoutes from "./src/modules/AdminDashboard/admin.routes.js";
import traineeExploreRouter from "./src/modules/TraineeMobile/Explore/explore.routes.js";
const app = express();
const port = 4000;
app.use(cors());

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use("/api/v1/dashboard/auth", adminAuthRoutes);



app.use("/api/v1/mobile/trainee/auth", traineeAuthRouter);
app.use("/api/v1/mobile/traniee/explore", traineeExploreRouter);
app.use("/api/v1/dashboard/tranier/auth", trainerAuthRoutes);
app.use("/api/v1/dashboard/admin/auth", adminAuthRoutes);
app.use("/api/v1/dashboard/admin", adminControllerRoutes);


app.all("*", (req, res, next) => {
    next(new AppError("Endpoint was not found", 404));
  });
  
  app.use(globalErrorHandling);
  
  dbConnection();
  app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`));