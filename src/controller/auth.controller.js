const jwt = require('jsonwebtoken')
import { configDotenv } from 'dotenv';
import User from '../model/user.model.js';
import bcrypt from 'bcrypt'

const generateToken = async ( userId, email ) => {

    const token = jwt.sign(
        {
            id : userId,
            email : email
        }, 
        process.env.SECRET_KEY, 
        {
            expiresIn: '1h' 
    });

    return token;
}

const signUp = async (req, res) => {

    try {
        const {name, email, password} = req.body;
    
        const user = await User.findOne({email : email});

        if(user) {
            return res.status(404).json({
                success: false,
                message : "Email Already Exist"
            })
        }

        const saltRound = 10;
        // Hashing a password

        const hashedPassword = await bcrypt.hash(password, salt);

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
        

    }
}

const login = async (res, req) => {

    const {email, password} = req.bobdy;

    const user = await findOne({email : email});

    if(!user) {
        return res.status(404).json({
            success : false,
            message : "Email or Password is wrong"
        })
    }

    const checkHashedPassword = bcrypt.compare(password, hashedPassword);

    if(!checkHashedPassword) {
        return res.status(404).json({
            success : false,
            message : "Email or password is wrong"
        })
    }

    const token = generateToken(user._id, email);

    return res.status(200).json({
        success: true,
        message: "Successfully login",
        token : token
    })
    
}

export {
    signUp,
    login
}