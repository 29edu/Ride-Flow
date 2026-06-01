

// Get the request stored in the Redis
import { client } from "../config/redis.js";

const isRequestDropped = async (driverId, newRequestCount, leakRate) => {

    const data = await client.hgetall(`bucket:${driverId}`);

    let bucket_size = data.bucket_size==null? 0 : data.bucket_size; // Giving default value to the bucket_size in case new driver came
    let capacity = data.capacity==null ? 1000 : data.capacity;
    let last_checked = data.lastChecked==null ? Date.now() : data.lastChecked;

    bucket_size = Number(bucket_size);
    capacity = Number(capacity);
    last_checked = Number(last_checked)

    const current_time = Date.now(); // Give the current time in milli seconds

    const duration = current_time - last_checked;
    duration = duration/1000; // converting to seconds
    const processedRequest = duration * leakRate;

    const leftRequestInBucket = bucket_size - processedRequest;

    leftRequestInBucket = (leftRequestInBucket  >=  0) ? leftRequestInBucket : 0;
    const totalRequest = leftRequestInBucket + newRequestCount;

    const isDropped = (totalRequest > capacity ? true: false) 
    if(isDropped) {
        bucket_size = capacity;
    } else {
        bucket_size = totalRequest;
    }
    
    last_checked = current_time;

    const newData = {
        bucket_size,
        capacity,
        last_checked
    }

    await client.hset(`bucket:${driverId}`, newData);
    return isDropped;
}

export {isRequestDropped}