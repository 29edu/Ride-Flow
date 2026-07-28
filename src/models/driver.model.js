import mongoose from 'mongoose';
import User from './user.model.js';

const driverSchema = new mongoose.Schema(
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

        x: {
            type : Number, 
            required: true
        },

        y: {
            type : Number,
            required: true
        },

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

export const Driver = mongoose.model('Driver', driverSchema);
