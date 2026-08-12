
import { createServer } from "node:http";
import { Server } from "socket.io";
import express, {type Express} from 'express'
import { json } from "node:stream/consumers";

const app : Express = express()
app.use(express.json())

const httpServer = createServer();

const io = new Server(httpServer, {

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


// app.listen(5009, () => { wrong because this will create another httpServer 
//     console.log("Server is running at http://localhost:5009");
// })

httpServer.listen(5009, () => {
    console.log("Server is running at http://localhost:5009")
})


