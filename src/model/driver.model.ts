import mongoose from 'mongoose';
import User from './user.model.js';

interface Address {
    city : String,
    state : String,
    Country : String
}

interface IDriver {
    driverId : String,
    name : String,
    phoneNumber : String,
    zone : Number
    available : Boolean,
    assignedServer : String,
    vehicleNumber : String,
    verificationStatus : Boolean,
    vehicleType : "Bike" | "Car",

}

const driverSchema = new mongoose.Schema<IDriver>(
    {
        driverId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        name: {
            type : String,
            required: true,
            maxlength: 50
        },

        phoneNumber : {
            type : String,
            required : true,
            maxlength : 20
        },

        address : {
            city : {
                type : String,
                required : true
            },

            state : {
                type : String,
                required : true
            },

            country : {
                type : String,
                required : true
            }
        },
        // planar coordinates (projected lon/lat) used by the KD-tree


        zone: {
            type: Number, 
            required: true
        }, // 0..numZones-1

        available: {
            type : Boolean,
            default: Boolean,
            index: true
        },

        assignedServer: String, // owning matching server (consistent hashing)

        vehicleNumber : {
            type : String,
            required : true,
        },

        verificationStatus : {
            type : Boolean,
            default : false,
        },

        vehicleType : {
            type : String,
            enum : ["Bike", "Car"],
            required : true
        },

    },
    
    { timestamps: true },
);

driverSchema.index({ zone: 1, available: 1 });

export const Driver = mongoose.model<IDriver>('Driver', driverSchema);