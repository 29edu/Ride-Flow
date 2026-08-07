
import express, {type Express, type Request, type Response} from 'express'
import roleCheck from '../middlewares/role.middleware.ts'
import verifyToken from '../middlewares/auth.middleware.ts'

const router = express.Router()

// Only admin can access this router

router.get('/admin', verifyToken, roleCheck("admin"), (req : Request, res : Response) => {
    res.json({
        message : "Welcome Admin"
    })
})

// Both admin and Driver can access this router
// Role check is a function so  I need to return it
router.get('/driver', verifyToken, roleCheck("admin", "driver"), (req : Request, res : Response) => {
    res.json({
        message : "Welcome Driver"
    })
})

// Admin and Rider can access this router

router.get('/rider', verifyToken, roleCheck("admin", "rider"), (req : Request, res : Response) => {
    res.json({
        message : "Welcome Rider"
    })
} )

export default router