
import {type Request, type Response} from 'express'
import { client } from '../config/redis.ts';
import { v4 as uuidv4} from 'uuid'
import { Driver } from '../model/driver.model.ts';
import {h3} from 'h3-js'
import producer from '../../shared/kafka/producer.ts';

// Active session and Live Session
// Active Session is used just like login, where it says for a period of time -> The driver is authenticated.
// Live session is for the driver that can become avaible or not available according to her choice easily. 

// const activeSessionStorage = async (req : Request, res : Response) => {

const activeSessionStorage = async (email : string, deviceId : string, status : string) : Promise<string> => {

    try {

        const driver = await Driver.findOne({ email})


        if(!driver) {
            throw new Error ("Driver not found")
        }

        let canPublishLocation = true
        if(driver.banned || driver.verificationStatus!=="Approved") {
            canPublishLocation = false
        }

        const createdAt = Date.now()
        const expiresAt = Date.now() + 60 * 60 * 24 * 1000;

        const activeSessionId = uuidv4()
        const activeSessionKey = `activeSessionId:${activeSessionId}`;
        
        await client.hSet(activeSessionKey, {
            'sessionId' : activeSessionKey,
            'driverId' : driver.driverId,
            'deviceId' : deviceId,
            'status' : status,
            'createdAt' : createdAt.toString(),
            'expiresAt' : expiresAt.toString(),
            'canPublishLocation' : canPublishLocation.toString()
        })

        // Setting up TTL in the Redis for Auto Expiration of the Session Key

        await client.expire(activeSessionKey, 24 * 60 * 60) // Redis store the time in seconds

        return activeSessionKey;
        
    } catch (error : unknown) {

        if(error instanceof Error) {
            console.error("Error in the Active Session Service", error.message)
        } else {
            console.error("Error in the Active Session Service", error)
        }

        throw error;
    }
}


const liveSessionStorage = async ( req : Request, res : Response) => {

    const {driverId, available, currentSessionId, latitude, longitude, lastLocationUpdate} = req.body;

    try {
        const driver = await Driver.findOne({driverId});

        if(!driver || !currentSessionId) {
            return res.status(400).json({
                success:false,
                message: "Cannot find the Driver"
            })
        }

        const  resolution = 8;
        const h3cell = h3.latLngToCell(latitude, longitude, resolution);
        await client.sAdd(`driverIds:${h3cell}`, driverId)

        const driverSession = await client.hGetAll(`activeSessionId:${currentSessionId}`);  // So if the driver doesn't have any active session, Live 
        // session cannot be created. 

        if(Object.keys(driverSession).length === 0) {
            
            return res.status(404).json({
                success : false,
                messgae : "Driver doesn't exist"
            })
        }

        if(driver.banned) {
            return res.status(403).json({
                success : false,
                message : "Driver is banned"
            })
        }

        const liveSessionKey = `liveSessionDriverId:${driverId}`

        await client.hSet(liveSessionKey, {
            'online' : "1",
            "available" : available, // during online the driver can still be unavailable , maybe he is already booked by someone
            "currentSessionId" : currentSessionId,
        })

        // Sending message to the kafka cluster
        await producer.send({
            topic: 'Driver-status',
            messages: [
                { key : String(driverId),
                  value : JSON.stringify({
                    driverId,
                    type: "DriverAvailability",
                    available: available,
                    message: `Driver is ${available}`,
                  })
                }
            ]
        })

    } catch (error : unknown) {
        
        if(error instanceof Error) {
            console.error("Live Session Storage Error in Redis", error.message)
        } else {
            console.error("Live Session Storage Error in Redis", error)
        }

        return res.json({
            success : false,
            message : "Internal Server Error"
        })
    }
}

export {
    activeSessionStorage,
    liveSessionStorage
}