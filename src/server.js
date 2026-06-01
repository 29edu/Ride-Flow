
import express from 'express'
import { connectDB } from './config/db.js'
import {createServer} from 'http'
import { Server } from 'socket.io'

const app = express()
app.use(express())

const httpServer = createServer(app);
const io = new Server(httpServer);


// app.listen(3000, () => {
//     console.log(`Server is running on http://localhost:3000`)
// })

httpServer.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`)
})

export {io}