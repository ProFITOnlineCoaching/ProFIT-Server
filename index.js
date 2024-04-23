import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { dbConnection } from "./DB/dbConnection.js";
import { globalErrorHandling } from "./src/middlewares/GlobalErrorHandling.js";
import { AppError } from "./src/utils/AppError.js";

import cors from "cors";
import traineeAuthRouter from "./src/modules/TraineeMobile/Auth/auth.routes.js";
import trainerAuthRoutes from "./src/modules/TrainerDashboard/Auth/auth.routes.js";
import adminAuthRoutes from "./src/modules/AdminDashboard/Auth/auth.routes.js";
import adminControllerRoutes from "./src/modules/AdminDashboard/admin.routes.js";
import traineeExploreRouter from "./src/modules/TraineeMobile/Explore/explore.routes.js";
import tranieeProfileRouter from "./src/modules/TraineeMobile/Profile/profile.routes.js";
import tranieeHomeRouter from "./src/modules/TraineeMobile/Home/home.routes.js";
import tranieeWaterNeedsRouter from "./src/modules/TraineeMobile/Home/Water Needs/waterNeeds.routes.js";
import tranieeSleepingTrack from "./src/modules/TraineeMobile/Home/Sleeping Track/sleepingTrack.routes.js";
const app = express();
const port = 4000;
app.use(cors());

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/v1/dashboard/auth", adminAuthRoutes);



app.use("/api/v1/mobile/trainee/auth", traineeAuthRouter);
app.use("/api/v1/mobile/trainee/explore", traineeExploreRouter);
app.use("/api/v1/mobile/trainee/profile", tranieeProfileRouter);
app.use("/api/v1/mobile/trainee/home", tranieeHomeRouter);
app.use("/api/v1/mobile/trainee/water-intake", tranieeWaterNeedsRouter);
app.use("/api/v1/mobile/trainee/sleep", tranieeSleepingTrack);

app.use("/api/v1/dashboard/tranier/auth", trainerAuthRoutes);
app.use("/api/v1/dashboard/admin/auth", adminAuthRoutes);
app.use("/api/v1/dashboard/admin", adminControllerRoutes);

app.all("*", (req, res, next) => {
  next(new AppError("Endpoint was not found", 404));
});

app.use(globalErrorHandling);

dbConnection();
app.listen(process.env.PORT || port, () =>
  console.log(`Example app listening on port ${port}!`)
);
