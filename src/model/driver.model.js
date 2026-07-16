import mongoose from 'mongoose';

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
    },
    
    { timestamps: true },
);

driverSchema.index({ zone: 1, available: 1 });

export const Driver = mongoose.model('Driver', driverSchema);
