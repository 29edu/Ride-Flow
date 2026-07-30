import mongoose from 'mongoose';

interface Address {
    city : string,
    state : string,
    country : string
}

interface IDriver {
    driverId : string,
    name : string,
    phoneNumber : string,
    address : Address,
    vehicleNumber : string,
    verificationStatus : "Not Submitted" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Expired",
    vehicleType : "Bike" | "Car",
    banned : boolean
}

const driverSchema = new mongoose.Schema<IDriver>(
    {
        driverId: {
            type: String,
            required: true,
            unique: true,
        },

        name: {
            type : String,
            required: true,
            maxlength: 50
        },

        phoneNumber : {
            type : String,
            required : true,
            maxlength : 20,
            unique : true
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


        vehicleNumber : { // 
            type : String,
            required : true,
        },

        verificationStatus : {
            type : String,
            enum : ["Not Submitted", "Submitted", "Under Review", "Approved", "Rejected", "Expired"],
            default : "Not Submitted"
        },

        vehicleType : {
            type : String,
            enum : ["Bike", "Car"],
            required : true,
        },

        banned : {
            type : Boolean,
            default : false
        }
    },
    
    { timestamps: true },
);


export const Driver = mongoose.model<IDriver>('Driver', driverSchema);