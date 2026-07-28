
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

    phoneNumber : {
        type : String,
        required : true,
        maxlength : 20
    },


    role : {
        type : String,
        enum : ["Rider", "Driver", "Admin"],
        default : "Rider"
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