

// Get the request stored in the Redis
import { client } from "../config/redis.js";

let isRequestDropped = async (driverId, newRequestCount, leakRate) => {

    let data = await client.hgetall(`bucket:${driverId}`);

    let bucket_size = data.bucket_size==null? 0 : data.bucket_size; // Giving default value to the bucket_size in case new driver came
    let capacity = data.capacity==null ? 1000 : data.capacity;
    let last_checked = data.lastChecked==null ? Date.now() : data.lastChecked;

    bucket_size = Number(bucket_size);
    capacity = Number(capacity);
    last_checked = Number(last_checked)

    let current_time = Date.now(); // Give the current time in milli seconds

    let duration = current_time - last_checked;
    duration = duration/1000; // converting to seconds
    let processedRequest = duration * leakRate;

    let leftRequestInBucket = bucket_size - processedRequest;

    leftRequestInBucket = (leftRequestInBucket  >=  0) ? leftRequestInBucket : 0;
    let totalRequest = leftRequestInBucket + newRequestCount;

    let isDropped = (totalRequest > capacity ? true: false) 
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