
import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

interface Coordinates {
    x : Number,
    y : Number
}

interface Someone {
    name : String,
    phoneNumber : String
}

interface IRide {
    userId : Types.ObjectId,
    driverId : Types.ObjectId,
    pickupLocation : Coordinates,
    dropoffLocation : Coordinates,
    fare : Number,
    pickupTime ?: Date,
    dropoffTime ?: Date,
    rider : "me" | "someone",
    someone ?: Someone
}


const rideSchema = new mongoose.Schema <IRide>({

    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },

    driverId : {
        type : Schema.Types.ObjectId,
        ref : "Driver"
    },

    pickupLocation : {
        x : {
            type : Number,
            required : true
        },

        y : {
            type : Number,
            required : true
        },
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

    dropoffTime : {
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

const Ride = mongoose.model<IRide>("Ride", rideSchema);

export default Ride;