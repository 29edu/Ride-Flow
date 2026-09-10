
import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId : 'my-app',
    // brokers: ['kafka1:9092', 'kafka2:9093'], // This one is used when I am using docker with kafka
    brokers: ['localhost:9092'] // Represented an array because kafka can have multiple brokers
})

const admin = kafka.admin()

async function connectAdmin() {

    try {
        
        await admin.connect();

        await admin.createTopics({
            validateOnly: false,
            waitForLeaders: true,
            timeout: 5000,
            topics:  [{
                topic : "Notification-topic",
                numPartitions : 3, 
                replicationFactor : 1, // I set 1 because right now only one broker is running
                replicaAssignment : []
            },
            {
                topic: "Driver-status",
                numPartitions: 3,
                replicationFactor: 1,
                replicaAssignment: []
            }
            ],
        })

        console.log("Kafka Admin is connected")

        const topicMetadata = await admin.fetchTopicMetadata({ topics: ['Notification-topic'] }) // This returns an array for different topic
        const paritions = topicMetadata.topics[0];
        const topicOffset = await admin.fetchTopicOffsets("Notification-topic")
        const topicList = await admin.listTopics()


        console.log("Topic Metadata" , topicMetadata)
        console.log(paritions)
        console.log("Topic List : ", topicList )
        console.log("Topic offset", topicOffset)
        
    } catch (error : unknown) {
        
        console.log("kafka Admin Connection failed")
        if(error instanceof Error) {
            console.error("Error is ", error.message)
        }
        else {
            console.error("Error is :" , error)
        }
        
    }
}

connectAdmin();

export {
    kafka
}
