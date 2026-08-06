
import {type Request, type Response} from 'express'

const testing = async (req : Request, res : Response) => {

    try {

        return res.status(200).json({
            success : true,
            message : "Login Successful......."
        })

    } catch (error : unknown) {
        
        return res.status(500).json({
            success  :false,
            message : "Login Unsuccessfulll"
        })
    }
}

export default testing