
import {type Request, type Response} from 'express'
import { client } from '../config/redis.ts';
import { v4 as uuidv4} from 'uuid'
import { Driver } from '../model/driver.model.ts';

const activeSessionStorage = async (req : Request, res : Response) => {

    try {
        const {driverId, deviceId, status} = req.body;
        const activeSessionKey = uuidv4()

        const driver = await Driver.findOne({driverId})

        if(!driver) {

            return res.status(400).json({
                success : false,
                message : "Invalid Driver"
            })
        }

        let canPublishLocation = true
        if(driver.banned || driver.verificationStatus!=="Approved") {
            canPublishLocation = false
        }

        await client.hSet(`activeSessionId:${activeSessionKey}`, {
            'sessionId' : activeSessionKey,
            'driverId' : driverId,
            'deviceId' : deviceId,
            'status' : status,
            'createdAt' : Date.now(),
            'expiresAt' : Date.now() + 60 * 60 * 24 * 1000,
            'canPublishLocation' : canPublishLocation.toString()
        })

        return res.status(201).json({
            success : true,
            sessionId : activeSessionKey
        })
        
    } catch (error : unknown) {

    }
}

const liveSessionStorage = async ( req : Request, res : Response) => {

    const {driverId, available, currentSessionId, latitude, longitude, h3cell, lastLocationUpdate} = req.body;

    try {
        const driver = await Driver.findOne({driverId});

        if(!driver || !currentSessionId) {
            return res.status(400).json({
                success:false,
                message: "Cannot find the Driver"
            })
        }

        const driverSession = await client.hGetAll(`activeSessionId:${currentSessionId}`);  

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

        const liveSessionKey = `driverId:${driverId}`

        await client.hSet(liveSessionKey, {
            'online' : "1",
            "available" : available,
            "currentSessionId" : currentSessionId,
            "latitude" : latitude,
            "longitude" : longitude,
            "h3cell" : h3cell,
            "lastLocationUpdate" : lastLocationUpdate
        })

    } catch (error : unknown) {
        
        if(error instanceof Error) {
            console.log("Live Session Storage Error in Redis", error.message)
        } else {
            console.log("Live Session Storage Error in Redis", error)
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