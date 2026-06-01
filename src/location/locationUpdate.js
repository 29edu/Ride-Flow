
import { io } from "../server.js";

import { isRequestDropped } from "./leaky_bucket.js";

io.on("connection", (socket)  => {
    socket.on("location:update", async (data)  => { // name of the event and data associated with it
        
        const {driverId, latitute, longitude} = data

        const isDropped = await isRequestDropped(driverId, 1, 100);

        if(isDropped) {
            console.log("Driver location is not updating");
        } else {
            console.log(`Driver new location is Latitude: ${latitute} and Longitude: ${longitude}`)
        }
    })
})
