
import mongoose from "mongoose";

interface IUser {
    name : String,
    email : String,
    password : String,
    passwordResetTokenHash : String,
    forgetPasswordExpireAt : Date
}

const userSchema = new mongoose.Schema<IUser>({
    name : {
        type : String,
        required : true,
        maxLength : 30,
        trim: true
    },

    email : {
        type : String,
        required : true,
        unique :true,
        lowercase : true
    },

    password : {
        type : String,
        required : true,
        minlength : 3
    },

    passwordResetTokenHash : {
        type : String
    },

    forgetPasswordExpireAt : {
        type : Date
    }
}
    ,{
        timestamps : true
    }

)

const User = mongoose.model<IUser>('User', userSchema); // Creats a User class from the schema
// structure. and allows to perform methods

export default User;