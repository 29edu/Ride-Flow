
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/rideFlow')

        console.log('DB connected')
    } catch(error) {
        console.log("Failed to connect", error.message)
    }
}

export {connectDB}