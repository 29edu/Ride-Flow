
import {type Request, type Response} from 'express'
import { UUID } from 'mongodb';
import { client } from '../config/redis.ts';
import {h3} from 'h3-js'

const locationStore = async (req : Request, res : Response) => {

    const {driverId, latitude, longitude, timestamp, speed} = req.body; // validation of the information will be done in the middleware

    try {

        const redisKey = `locationDriverId:${driverId}`;
        const resolution = 8;

        const h3cellId =  h3.latLngToCell(latitude, longitude, resolution);

        await client.hSet(redisKey, {
            'latitude' : latitude,
            'longitude' : longitude,
            'clientTimeStamp' : timestamp,
            'severTimeStamp' : Date.now().toString(),
            'speed' : speed,
            'h3cellId' : h3cellId
        })

        return res.status(201).json({
            success : true,
            message : "Successfully stored Driver Location Details",
        })

    } catch (error : unknown) {
        
        if(error instanceof Error) {
            console.log("Found Error in the location update : ", error.message );
        } else {
            console.log("Error in the location update : ", error)
        }
    }
}

export default locationStore;