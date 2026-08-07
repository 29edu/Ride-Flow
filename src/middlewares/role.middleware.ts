
import express , {type Request, type Response, type NextFunction} from 'express'
import User from '../model/user.model.ts'

type Role = "admin" | "rider" | "driver"

const roleCheck = (...allowedRoles : Role[]) => {

    const roles = async (req : Request, res : Response , next : NextFunction) => {

        const user = req.user;

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User doesn't exist"
            })
        }

        if(!allowedRoles.includes(user.role as Role)) {
            return res.status(403).json({
                success : false,
                message : "unauthorized access"
            })
        }

        next();
    }

    return roles;
}

export default roleCheck;