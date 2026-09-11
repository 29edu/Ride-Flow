import {kafka} from '../../../shared/kafka/admin.ts'
import { client } from '../../../src/config/redis.ts';

const consumer = kafka.consumer({groupId : 'riderGroup'})

await consumer.connect();
await consumer.subscribe({
    topics: ['Driver-status'],
    fromBeginning : false
})

await consumer.run({
    eachMessage : async ({topic , partition, message}) => {
        console.log('Received: ', {
            topic,
            partition,
            offset : message.offset,
            key : message.key?.toString(),
            value: message.value?.toString(),
            headers: message.headers
        })
        if(message.value == null) {
            throw new Error("Driver-status has no value");
        }
        const nextOffset = (BigInt(message.offset + 1n).toString())
        // Logic of driver-status and storing in the same h3 cell in the redis
        const event = JSON.parse(message.value?.toString()) // i Changed into strings because message.value returns buffers not the string.
        // After comming form the producer, kafkajs stores the information in the buffer containing the message bytes 
        const {driverId, type, available, messageFromProducer} = event;
        
        if(available === "available") {
            
            const driverDetails = await client.hGetAll(`locationDriverId:${driverId}`)
            const driverH3Cell = driverDetails.h3CellId;
            const redisKey = `driverH3Cell:${driverH3Cell}`
            await client.sAdd(redisKey, driverId)
            console.log("Successfully stored the driver in the h3 cell")

        } else {
            console.log("Failed to add the driver in the h3 cell of redis because of driver unavailable")
        }

        try {
            await consumer.commitOffsets([{ // i can set to multiple commits
                topic,
                partition,
                offset: nextOffset
            }])

            console.log("Successfully offset")

        } catch (error : unknown) {

            console.error("Failed commit", {
                topic, 
                partition,
                nextOffset
            })
            
            if(error instanceof Error) {
                console.error("Found Error in commiting the offset :", error.message)
            } else {
                console.error("Found error in commiting the offset ", error)
            }
        }
    },
})


export default



