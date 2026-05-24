
# Real time communication

    For real time communication, either i can use kafka or redis pub/sub.

## Difference

    1. Redis pub/sub has latency of sub-millisecond and kafka has 5-10 ms
    2. Message Persistance -> Fire and forget , Kafa -> Stored on disk
    3. Replay Ability -> Don't replay, Kafa -> support it
    4. At-scale throughput -> Good (~100k messages/sec) , Kafka-> Excellent (~1M msg/sec)
    5. Complexity-> low, kafka -> high