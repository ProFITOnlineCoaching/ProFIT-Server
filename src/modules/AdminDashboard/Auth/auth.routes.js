
import { Router } from "express";
const adminAuthRoutes = Router();
import * as auth from "./auth.controller.js";

adminAuthRoutes.post('/signup',auth.signUpAdmin)
adminAuthRoutes.post('/signin',auth.signIn)



export default adminAuthRoutes;



