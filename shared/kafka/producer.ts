
import { CompressionTypes } from "kafkajs";
import { kafka } from "./admin.ts";

const producer = kafka.producer();

await producer.connect();

export default producer;