import { Router } from "express";
const tranieeHomeRouter = Router();
import * as home from "./home.controller.js";
import { checkRole, verifyToken } from "../../../middlewares/authToken.js";


tranieeHomeRouter.get(
    "/",
    verifyToken,
    checkRole("trainee"),
    home.homeNavbar
  );

  export default tranieeHomeRouter;
