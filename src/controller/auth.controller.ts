import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import User from '../model/user.model.ts';
import { compare, genSalt, hash } from 'bcrypt-ts'
import express, {type Express, type Request, type Response} from 'express'
import { Types } from 'mongoose';
import { activeSessionStorage } from '../services/session.service.ts';
import { randomUUID } from 'node:crypto';

const generateToken = ( userId : Types.ObjectId , email : String ) => { // no async needed, don't use async with the generate Token

    const token = jwt.sign(
        {
            id : userId,
            email : email
        }, 
        "secretKey", 
        {
            expiresIn: '1h' 
    });

    return token
}

const signUp = async (req : Request, res : Response) => {

    try {

        const {name, email, password, role} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                success : false,
                message : "Invalid Data"
            })
        }

        const user = await User.findOne({email : email});

        if(user) {
            return res.status(404).json({
                success: false,
                message : "Email Already Exist"
            })
        }

        console.log("Hased Password")
        const saltRound = await genSalt(10);
        // Hashing a password
        // const hashedPassword = await bcrypt.hash(password, saltRound);
        const hashedPassword = await hash(password, saltRound)
        
        const newUser = await User.create({
            name,
            email,
            password : hashedPassword
        })

        const token = generateToken(newUser._id, email);
        const deviceId = randomUUID(); // This will be stored locally

        // const sessionId = await activeSessionStorage(email, deviceId, "Not Submitted" );

        return res.status(201).json({
            success: true,
            message: "User Created",
            token : token,
            role
            // sessionId : sessionId
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message : "Interval Serval Errorrrrr"
        })
    }
}

const login = async (req : Request, res : Response) => {

    try {

        const {email, password} = req.body;
        const user = await User.findOne({"email" : email});

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "Email or Password is wrong...."
            })
        }

        const hashedPassword = user.password
        // const checkHashedPassword = await compare(password, hashedPassword);
        const checkHashedPassword = await compare(password, hashedPassword)

        if(!checkHashedPassword) {
            return res.status(404).json({
                success : false,
                message : "Hashed Email or password is wrong..."
            })
        }

        const token = generateToken(user._id, email);
        if(!token ) {
            console.log("Failed to generate token")
        }

        // const deviceId = randomUUID();
        // const sessionId = await activeSessionStorage(email, deviceId, user.verificationStatus )

        return res.status(200).json({
            success: true,
            message: "Successfully login",
            token : token,
            // sessionId : sessionId
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Found some Error in login"
        })
    }
}

export {
    signUp,
    login
}