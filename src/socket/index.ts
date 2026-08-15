
import { Server } from "socket.io"; 
import express, {type Express} from 'express'
import {Gauge, register} from "prom-client"
import {Server as HTTPServer} from "node:http"
import {Server as socketIoServer} from "socket.io"
import "dotenv/config"
import jwt from "jsonwebtoken";


// or
const app : Express = express()
app.use(express.json())

// const activeConnections = new Gauge({
//     name : "socketio_connections_active",
//     help : "Current number of active socket.io connections",
// });

type Verify = Response | void;

const secretKey = process.env.SECRET_KEY ;

if(!secretKey) {
    throw new Error("Secret key is missing")
}

const initializeServer = (server : HTTPServer) : socketIoServer | undefined => {

    const io = new Server(server)
    console.log("Connected to the Socket")

    io.use((socket, next) => {
        
        try {
            const authorizationToken = socket.handshake.headers.auth; // bearer token
    
            if(!authorizationToken || authorizationToken== undefined) {
                next(new Error("Authentication Failed. Token is missing")) // This next(new Error ...) means Authentication has failed and send this error
                // to the client
                return // I use return because code might run after this
            }
            
            if(Array.isArray(authorizationToken)) {
                next(new Error("Authentication failed, it is an array"))
                return
            }
    
            jwt.verify(authorizationToken, secretKey, function(err, decoded ) {

                if(err) {
                    throw new Error("Authentication Failed in the jwt verify", err);
                }

                console.log("Verification of token done");

                const payload = decoded;
                console.log(payload)
            })

            console.log(authorizationToken)
            next();
        } catch (error) {
            
            const authError = error instanceof Error ? error : new Error("Authentication failed")

            next(authError)
        }
    
    })

    io.on("connection", (socket) => { // fired upon connecting with the client
        // disconnect fired upon client disconnection
        console.log("User connected", socket.id)
        socket.on("chat message", (msg) => {
            console.log("Message from ", socket.id, msg);
            socket.broadcast.emit("chat response",  {
                message : msg
            })
        })
        socket.on("disconnect", () => {
            console.log("User disconnected")
        })
    });

    return io;
    
}

export default initializeServer;
// We added app here only so that same server can expose a Prometheus end point later
// http://locahost:5009/metrics 


