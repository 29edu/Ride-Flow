
import express from 'express'
import { signUp, login } from '../controller/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

console.log("I am in Router")
router.post('/signup',  signUp);


router.post('/login', login);

export default router

