
import {type Request, type Response} from 'express'
import { UUID } from 'mongodb';
import { client } from '../config/redis.ts';

const locationStore = async (req : Request, res : Response) => {

    const {driverId, latitude, longitude, timestamp, speed, } = req.body; // validation of the information will be done in the middleware

    try {

        const redisKey = `locationDriverId:${driverId}`;

        await client.hSet(redisKey, {
            'latitude' : latitude,
            'longitude' : longitude,
            'clientTimeStamp' : timestamp,
            'severTimeStamp' : Date.now().toString(),
            'speed' : speed
        })

        return res.status(201).json({
            success : true,
            message : "Successfully stored Driver Location Details",
        })

    } catch (error) {
        
    }
}

export default locationStore;