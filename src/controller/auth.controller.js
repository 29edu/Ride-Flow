import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import User from '../model/user.model.js';
import bcrypt from 'bcrypt'
import express from 'express'

const generateToken = ( userId, email ) => { // no async needed, don't use async with the generate Token

    const token = jwt.sign(
        {
            id : userId,
            email : email
        }, 
        "secretKey", 
        {
            expiresIn: '1h' 
    });

    return token;
}

const signUp = async (req, res) => {

    try {

        const {name, email, password} = req.body;
        console.log(`name : ${name}, Email : ${email} , Password : ${password}`)
        const user = await User.findOne({email : email});
        if(user) {
            return res.status(404).json({
                success: false,
                message : "Email Already Exist"
            })
        }

        console.log("Hased Password")
        const saltRound = 10;
        // Hashing a password
        const hashedPassword = await bcrypt.hash(password, saltRound);
        
        const newUser = await User.create({
            name,
            email,
            password : hashedPassword
        })

        const token = generateToken(newUser._id, email);

        return res.status(201).json({
            success: true,
            message: "User Created",
            token : token
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : "Interval Serval Errorrrrr"
        })
    }
}

const login = async (req, res) => {

    try {
        
        const {email, password} = req.body;
        const user = await User.findOne({"email" : email});

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "Email or Password is wrong"
            })
        }

        console.log("Working")
        const hashedPassword = user.password
        const checkHashedPassword = bcrypt.compare(password, hashedPassword);

        if(!checkHashedPassword) {
            return res.status(404).json({
                success : false,
                message : "Email or password is wrong"
            })
        }

        const token = generateToken(user._id, email);
        if(!token ) {
            console.log("Failed to generate token")
        }
        return res.status(200).json({
            success: true,
            message: "Successfully login",
            token : token
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