
import jwt from 'jsonwebtoken'

import type {
    Request,
    Response,
    NextFunction
} from "express"

const authMiddleware = (req : Request, res : Response, next : NextFunction) => {

    const authorization = req.headers.authorization;

    if(!authorization) {
        return res.status(403).json({
            success : false,
            message : "No Token provided"
        })
    }

    const [scheme, token] = authorization.split(" ");

    if(scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success : false,
            message : "Use : Bearer <token>"
        })
    }

    const secretKey : string | undefined = process.env.SECRET_KEY;

    if(!secretKey) {
        throw new Error("Secret key is missing from .env")
    }

    try {
        
        jwt.verify(token, secretKey , function(err, decoded) {
            
            if(err) {
                return res.status(401).json({
                    success : false,
                    message : "Expired Token/Something went wrong"
                })
            }

            console.log("Successfully Verified token")
            next();

        });

    } catch (error) {

        if(error instanceof Error) {
            console.log("Error : ", error.message)
        } else {
            console.log("Error : ", error)
        }
        
        return res.status(500).json({
            success : false,
            message : "Some internal Error"
        })
    }
} 

export default authMiddleware;