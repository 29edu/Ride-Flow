
import express, {type Express, type Request, type Response} from 'express'

const router = express.Router()

// Only admin can access this router
router.get('/admin', (req : Request, res : Response) => {
    res.json({
        message : "Welcome Admin"
    })
})

// Both admin and Driver can access this router

router.get('/driver', (req : Request, res : Response) => {
    res.json({
        message : "Welcome Driver"
    })
})

// Admin and Rider can access this router

router.get('/rider', (req : Request, res : Response) => {
    res.json({
        message : "Welcome Rider"
    })
} )

export default router