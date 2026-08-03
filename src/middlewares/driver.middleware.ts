
import express, {type Express, type Request, type Response, type NextFunction} from 'express'
import { Driver } from '../model/driver.model.ts';

const driverValidation = async (req : Request, res : Response, next : NextFunction) => {

    const {driverId} = req.body;

    try {
        
        const driver = await Driver.findOne({driverId})

        if(!driver) {
            return res.status(400).json({
                success : false,
                message : "Invalid Driver"
            })
        }

        if(!driver.available) {
            return res.status(200).json({
                success : false,
                message : "Driver is Offline"
            })
        }

            

    } catch (error) {
        
    }
}