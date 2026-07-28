
import mongoose from "mongoose";
import User from "./user.model.js";
import { Driver } from "./driver.model.js";

const rideSchema = new mongoose.Schema({

    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },

    driverId : {
        type : Schema.Types.ObjectId,
        ref : "Driver"
    },

    currentLocation : {
        x : {
            type : Number,
            required : true
        },

        y : {
            type : Number,
            required : true
        }
    },

    pickupLocation : {
        x : {
            type : Number,
            required : true
        },

        y : {
            type : Number,
            required : true
        }
    },

    dropoffLocation : {
        x : {
            type : Number,
            required : true
        },

        y : {
            type : Number,
            required : true
        }
    },

    fare : {
        type : Number,
        required : true
    },

    pickupTime : {
        type : Date
    },

    rider : {
        type : String,
        enum : ["me", "someone"],
        default : "me"
    },

    someone : {
        name : {
            type : String,
            required : true,
        },

        phoneNumber : {
            type : String,
            required : true,
            maxlength: 10
        },
        
    }

}, {
    timestamps : true
})

const Ride = new mongoose.model("Ride", rideSchema);

export default Ride;