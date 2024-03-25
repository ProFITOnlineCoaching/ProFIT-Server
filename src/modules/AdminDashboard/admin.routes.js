import { Router } from "express";
const adminControllerRoutes = Router();
import * as controller from "./admin.controller.js";
import { checkRole, verifyToken } from "../../middlewares/authToken.js";

adminControllerRoutes.get('/trainers/requests',verifyToken,checkRole('admin'),controller.getAllTrainersRequests)
adminControllerRoutes.get('/trainers/:id',verifyToken,checkRole('admin'),controller.getTrainerDetails)
adminControllerRoutes.post('/trainers/:id/accept',verifyToken,checkRole('admin'),controller.adminAcceptTrainer)
adminControllerRoutes.post('/trainers/:id/refuse',verifyToken,checkRole('admin'),controller.adminDeclineTrainer)

adminControllerRoutes.get('/trainers',verifyToken,checkRole('admin'),controller.getAllTrainers)
adminControllerRoutes.get('/trainers/active',verifyToken,checkRole('admin'),controller.getAllAcceptedTrainers)
adminControllerRoutes.get('/trainers/blocked', verifyToken, checkRole('admin'), controller.getAllBlockedTrainers);
adminControllerRoutes.get('/trainers/pending', verifyToken, checkRole('admin'), controller.getAllPendingTrainers);
adminControllerRoutes.patch('/trainers/:id/block',verifyToken,checkRole('admin'),controller.blockTrainer)
adminControllerRoutes.patch('/trainers/:id/unblock',verifyToken,checkRole('admin'),controller.unblockTrainer)

adminControllerRoutes.get('/trainees',verifyToken,checkRole('admin'),controller.getAllTrainees)
adminControllerRoutes.get('/trainees/:id',verifyToken,checkRole('admin'),controller.getTraineeDetails)
adminControllerRoutes.get('/trainees/active', verifyToken, checkRole('admin'), controller.getAllAcceptedTrainees);
adminControllerRoutes.get('/trainees/blocked', verifyToken, checkRole('admin'), controller.getAllBlockedTrainees);
adminControllerRoutes.get('/trainees/pending', verifyToken, checkRole('admin'), controller.getAllPendingTrainees);
adminControllerRoutes.patch('/trainees/:id/block', verifyToken, checkRole('admin'), controller.blockTrainee);
adminControllerRoutes.patch('/trainees/:id/unblock', verifyToken, checkRole('admin'), controller.unblockTrainee);




export default adminControllerRoutes;
