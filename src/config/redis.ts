
import { createClient, SocketTimeoutError } from "redis";

const client = createClient({
    url: 'redis://localhost:6380',

    socket : {
        // reconnectStrategy : false If i want that redis doesn't try reconnect

        connectTimeout : 10000,

        reconnectStrategy : (retries : number, cause : unknown) => {
            
            if(cause instanceof SocketTimeoutError) {
                throw new Error("")
            }

            if(retries >= 3) {
                throw new Error("Failed to connect to Redis after 3 Retries")
            }
        }
    }
});

client.on('error', (err : unknown) => {
    
    if(err instanceof Error) {
        console.log("Error in Redis : " ,err.message)
    } else {
        console.log("Error in Redis: ",err)
    }
})

try {
    
    await client.connect();
    console.log("Redis connected")

} catch (error : unknown) {
    
    if(error instanceof Error) {
        console.log("Failed to connect to Redis : ", error.message)
    } else {
        console.log("Failed to connect to Redis:", error)
    }
}