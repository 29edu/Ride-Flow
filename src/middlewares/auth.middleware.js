
import User from "../model/user.model.js";
import jwt from 'jsonwebtoken'
import { configDotenv } from "dotenv";

const authMiddleware = (req, res, next) => {

    const authorization_Bearer = req.headers.authorization;

    try {
        
        const token = authorization_Bearer[0];
        
        jwt.verify(token, process.env.SECRET_KEY , function(err, decoded) {
            
            if(err) {
                return res.status(404).json({
                    success : false,
                    message : "Expired Token/Something went wrong"
                })
            }

            console.log("Successfully Verified token")
            next();

        });

    } catch (error) {
        
        return res.status(500).json({
            success : false,
            message : "Some internal Error"
        })
    }
} 

export default authMiddleware;