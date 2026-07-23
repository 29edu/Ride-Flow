
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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

const User = new mongoose.model('User', userSchema);

export default User;