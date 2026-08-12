
# Scalibility

    ## How Node js handles many concurrent users at the same time

    Suppose there are 5 users who are sending messages concurrently. 

    But Node js main javscript thread can execute only one message callback at a time. 

    so maybe A gets picked first;

    (B, C, D, E) messages are not lost, they are waiting for their callback.

    Event loop starts to execute
    1. Suppose User A send the message first and want to access db then it will find the db through

    socket.on("message", async (msg) => {

        const user = await User.findById(msg.userId);

    })

    Then node js starts executing
    Event Loop
        ↓
    User A callback

    then it reaches user.find....

    The database driver sends a request towards mongoDB.

    Node
    │
    │      DB query for User A
    ▼
    MongoDB

    Now awaits is used. It means A is waiting for DB but Node.js main thread is not Waiting. 
    The main thread becomes free and A's database operation continoues indepedently. 
    
    NOw node can move to User B.

    (When the user A is waiting, database query is handled by the database server like monogoDB)

    So while mongodb is working on A,
    Node js main thread is free.

    NOw node can start working on the user B' callback

    when the promise is returned by the database, it is not neccesalirty continue immediately. It waits until the javascript thread is available.

    Then Node resumes A from exactly after the await.

    # Step 2

    Now B is free, so Node js start executing B -> reaches database -> await -> pauses

    Then, C callback starts ->  C sends DB query -> await -> C pauses

    Then D and then E

    Then the situation becomes

    Node.js main thread
      ↓
    FREE / handling other work

    Outstanding DB operations:

    A ───────────────► MongoDB
    B ───────────────► MongoDB
    C ───────────────► MongoDB
    D ───────────────► MongoDB
    E ───────────────► MongoDB

    Now all five callbacks are paused at their respective, await.

    # Inside the MongoDB

    Question:- how many queries can MongoDB can handle concurrently

    Mongodb doesn't have a fixed rule saying it only process ...  queries at a time.
    It can process multiple operations concurrently. 

    How mongodb get their queries?

    SMongoDB connection pool size = 5

    Connection 1 → Query A
    Connection 2 → Query B
    Connection 3 → Query C
    Connection 4 → Query D
    Connection 5 → Query E

    So it can handle all 5 queries concurrently.

    The current Mongodb NOde.js driver default maxPoolSize is 100, meaning one pool can maintain upto to 100 connections by default.

    If more than 100 queries come, it will wait in the queue. A queue is formed when the limit exceeeds the maxPoolSize

    Question:- Can we increase the size of the pool?

        Yes, it can be set by the user using the command

        await mongoose.connect(MONGO_URI, {  // mongo_url or uri for the local
            maxPoolSize: 300
        })

        But increasing the pool size cost more resources. It is multiplied across applications servers and replica set memebers.

        Eg:-

        10 Node js servers with each maxPoolSize = 500

        then 10 * 500 = 5000 application DB connections.

        Suppose there are 10 node js servers are running and every server has maxPoolSize = 10000

        then total DB connections = 1,00,000 connections.

        and With the replicas-sets, connections counts can multiply further beacuse drivers maintain pools/connections to replica-set members.

        Even if I allow 10,000 connections per serve, it will make the mongoDB slower than lets say 200.

        Because mongodb has finite CPU, RAM , disk bandwidth and internal exxectuion capaccity. More concurrent queries eventually means they start competiting for the same resources. 

        So CPU resources matter for the fast queries of the mongodb

    ## When it become bottleneck

        1. Suppose the every callback does heavy synchronous work like

            socket.on("message", async (msg) => {
                const user = await User.findById(msg.userId);

                heavyCalculation(); // takes 100 ms

                socket.broadcast.emit("chat response", msg);
            });

            During those 100ms, 

            A → waiting
            B → waiting
            D → waiting
            E → waiting

            Hence, New javascript work becomes ready faster than the main thread can    execute it.

            Incoming/ready work rate > Node's processing rate ( not many users exist)

        2. maxPoolSize

            Suppose 100 users send message and every message does await User.findById(...)

            Now if the mongodb pool has size= 10
            then only 10 queries can be processed at one time. Remaining have to wait in Queries.

        3. mongodb itself become saturated.

            100 Queries -> 100 DB connections available.
            All 100 queries reach mongoDB

            Now mongodb starts executing them but it has finite Resources
            CPU
            RAM
            DISK I/O

            now suppose CPU is near 100%

            Then enw queries cannot get enough processing time immediately and they have to wait in the queue

            The database is the slow component.

        4. Too many live socket.io connections consume server memory

            Even when users are idle, each connected socket needs some memory.

            socketA → connection state + listeners + buffers
            socketB → connection state + listeners + buffers
            socketC → connection state + listeners + buffers
            ...

            NOde js process must keep sockets objects and connections state in RAM

            RAM memory grows as users connections grows.
            If RAM gets nearly full
                Latency increases and process may run out of memory.

            Thus, too many simulatenously alive connections can exhaust memory even if they are not actively sending messages.

        5. Network bandwidth/ broadcasting

            Suppose ther are only 5 users, 

                1 user sent to 4 users

            But if there are 100,000 connected users:

                1 message -> broadcast -> 99,999 outgoing sends

            NOw many users are sending messages at the same time,

            100 users send
                ↓
            each broadcast to ~100,000 users
                ↓
            ≈ 10,000,000 outgoing message deliveries

            Node / Socket.IO
                ↓
            creates lots of outgoing data
                ↓
            network bandwidth gets saturated
                ↓
            socket buffers start filling
                ↓
            messages wait longer

            Outcome

                message sent
                    ↓
                broadcast delayed
                    ↓
                other users receive it late

            This is very dangerous in chat-like systems if i broadcast globally instead of only to the relevant room

            Thus, Too many outgoing messages can saturate network bandwith and socket buffers, even if the event loop and database are fine.

            (Saturation means a resource or us very close to its maximum useful capacity)


            CPU saturation     → CPU near 100% usage
            DB saturation      → DB cannot process queries fast enough
            Network saturation → bandwidth fully used
            Connection pool saturation → all connections busy

        6. Single NOde js server

            A single Node.js server/process itself become the limit which is why we horizontally scale to multiple Node.js instances.

            Suppose my machine has 8 CPU cors and Node js runs on single core.

            8-core machine

                Core 1 → Node.js process → 100% busy
                Core 2 → mostly free
                Core 3 → mostly free
                Core 4 → mostly free
                ...
                Core 8 → mostly free

            Now the traffic keep increasing

            More socket messages
                  ↓
            more callbacks become ready
                  ↓
            single Node event loop cannot execute them fast enough
                  ↓
            callback queue grows
                  ↓
            latency increases

            So even the machine has more CPU available, that single NOde process cannot fully use all cores for its jaascript Execution.

                            Load Balancer
                                 │
                    ┌────────────┼────────────┐
                    ↓            ↓            ↓
                 Node 1       Node 2       Node 3
                 sockets      sockets      sockets

            One Node process eventually cannot process incoming JavaScript events fast enough, so we add more Node processes or more servers and distribute the traffic across them.