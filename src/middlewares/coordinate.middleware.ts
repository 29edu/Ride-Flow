
import {type Request, type Response, type NextFunction} from 'express'
import { client } from '../config/redis.ts';

const coordinateValidation = async (req : Request, res : Response, next : NextFunction) => {

    const { latitude, longitude, accuracy, timestamps, sequenceNumber, speed, bearing, isMock, provider} = req.body;

    try {
        
        // Mathematical Validation 
        
        if(!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success : false,
                message : "Invalid Coordinates"
            })
        }

        if(accuracy > 500) {
            return res.status(406).json({
                success : false,
                message : "Unreliable Location"
            })
        }

        const ALLOWED_TIME = 60 * 1000 // 1 Minute
        const currentTime = Date.now();

        if(currentTime - timestamps > ALLOWED_TIME) {
            return res.status(408).json({
                success : false,
                message : "Request Timeout"
            })
        }

        // GPS Jump Detection :- To detect abnormal changing location

        // Haervsine Distance Calculation
        const harvensine = (lat1 : number, lon1 : number, lat2 : number, lon2 : number) : number => {

            let latitudeDistance = (lat2 - lat1) * Math.PI / 180.0;
            let longitudeDistance = (lon2 - lon1) * Math.PI / 180.0;

            // convert to radiansa
            lat1 = (lat1) * Math.PI / 180.0;
            lat2 = (lat2) * Math.PI / 180.0;

            // apply formula

            let a = Math.pow(Math.sin(latitudeDistance / 2), 2) + Math.pow(Math.sin(longitudeDistance / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
            let rad = 6371;
            let c = 2 * Math.asin(Math.sqrt(a));
            return rad * c;
        }

        const redisKey = `locationDriverId${driverId}`;
        const oldUserLocationData = await client.hGetAll(``)

    } catch (error : unknown) {
        
        if(error instanceof Error) {
            console.log("Error in Location Validation", error.message)
        } else {
            console.log("Error in location Validation", error)
        }

        return res.status(500).json({
            success : false,
            message : "Some Internal Error in the Coordinate Middleware"
        })
    }
}