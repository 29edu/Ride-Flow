import express, { type Express } from "express";
import { signUp, login } from "../controller/auth.controller.ts";
import verifyToken from "../middlewares/auth.middleware.ts";
import testing from "../controller/testing.controller.ts";

const router = express.Router();

console.log("Router ");
// router.get("/testing", testing);
router.post("/signup", signUp);
router.post("/login", login);
router.get('/testing', verifyToken, testing)

export default router;
