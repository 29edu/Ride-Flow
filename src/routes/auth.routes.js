
import express from 'express'
import { signUp, login } from '../controller/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const app = express();
const router = express.Router();

router.get('/signup',  signUp);
router.get('/login', login);

router.get('/check', authMiddleware, (req, res) =>  {

    try {
        
        
    } catch (error) {
        
    }
})