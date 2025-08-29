import express from "express";
import {forgotPassword, getUser,register, resetPassword} from "../controllers/usercontrollers.js";
import { verifyOTP,login } from "../controllers/usercontrollers.js";
import isAuthenticated from "../middlewares/auth.js";
const router=express.Router();
router.post("/register",register);
router.post("/verifyOTP",verifyOTP);
router.post("/login",login);

router.post("/me",isAuthenticated,getUser);
router.post("/password/forgot",forgotPassword);
router.put("/password/reset/:token",resetPassword);
export default router;

