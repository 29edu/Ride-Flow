
# Terms

    Durection :- It means how long the artillery continues generating new virtual users.

    arrivalRate:- It means numbers of vu to create per second.

    target:- On which running server should artillery create the virtual users.

    think:- It means how long the vu will exist before it dies. But think can also be used in other ways.

    rampUp:- It is used to increase the Arrivate rate just like accelration.
        If i write 

        phases:
        - duration: 20
          arrivalRate: 1
          rampTo: 5

        It means at the end of the 20 sec, the arrivate rate will reach 5. Starting     from 1 users per second to the 5 users oer second at the end. 

        Conceptually

        t = 0s        ≈ 1 VU/sec
                         │
                         │ rate gradually increases
                         ▼
        t = 20s       ≈ 5 VUs/sec

        VU creation rate

        5 |                    ●
          |                 /
        4 |              /
          |           /
        3 |        /
          |     /
        2 |  /
          |
        1 |●
          +-------------------------
           0        10         20 sec


        phases:

          - duration: 30
            arrivalRate: 1
            rampTo: 10

          - duration: 60
            arrivalRate: 10

          - duration: 30
            arrivalRate: 10
            rampTo: 50

        When I do this creation happen in phases and it doesn't mean the previous virtual users that were created are going to lost. Previous will work too according to the condition.

    
    Scenarios:

        It tells what should each virtual users actually do after being created

        For example:-

        connect
           ↓
        send "hello"
           ↓
        wait 5 seconds
           ↓
        send another message

        engine: socket.io -> It means run this scenario using the socket.io client engine. This matters because scoket.io is not just a raw websocket connection. It has its own protocal and connection behaviour on top of Engine.io

        How it works: 

            Artillery creates VU
                    ↓
            VU starts scenario
                    ↓
            engine: socketio
                    ↓
            Artillery creates Socket.IO client connection
                    ↓
            Node Socket.IO server accepts it
                    ↓
            io.on("connection") fires
                    ↓
            server creates socket object

        Flow after using think in the scenario

            VU is created
                 ↓
            Socket.IO scenario starts
                 ↓
            Socket.IO connection is established
                 ↓
            think: 20
                 ↓
            VU waits for 20 seconds
            while keeping the connection alive
                 ↓
            20 seconds finish
                 ↓
            scenario ends
                 ↓
            Socket.IO connection closes
                 ↓
            VU finishes

        Flow in the scenario:-

            When the atillery enters in scenario, what this particular user do and in what order?

            That ordered sequence goes inside the flow.
            Artilery describes a scenario as a sequence performed by a virtual user.

            Eg:-

                flow:
                - think: 5
                - emit:
                    channel: "chat message"
                    data: "Hello"
                - think: 10

                VU created
                   ↓
                Socket.IO connection established
                   ↓
                FLOW starts
                   ↓
                Step 1: think 5
                   ↓
                wait for 5 seconds
                   ↓
                Step 2: emit
                   ↓
                send Socket.IO event
                   ↓
                Step 3: think 10
                   ↓
                wait another 10 seconds
                   ↓
                flow finishes
                   ↓
                scenario finishes
                   ↓
                VU finishes / connection closes

            Artillery does not execute all flow actions simultaneously.

            Suppose there are 3 VUs

            Each has its own independent copy of that flow

            VU1                 VU2                 VU3
            │                    │                   │
            think 5             think 5             think 5
            │                    │                   │
            emit                 emit                emit
            │                    │                   │
            think 10            think 10            think 10
            │                    │                   │
            finish               finish              finish


            They can therefore be executing at the same time. This is how Aritillery creates oncurrency. 
            By default the instructions get fired single time .

            So we use count to increase the numbers of instructions to execute.
            For example , Suppose i want to send message "Hello" 5 times.

            flow:
            - loop:
                - emit:
                    - "chat message"
                    - "Hello"
              count: 5

            Now one Virtual Users does this:-
              VU1
              │
              ├── emit Hello   #1
              ├── emit Hello   #2
              ├── emit Hello   #3
              ├── emit Hello   #4
              └── emit Hello   #5

            Problem:- It will send the messages very quickly one after another. 
            So we put think to wait for x sec to send another message.

            flow:
            - loop:
                - emit:
                    - "chat message"
                    - "Hello"

                - think: 2

              count: 5

                (If i don't use count with the loop, it will run to infinity)

            Working:-

              emit message #1
                    ↓
              wait 2 sec
                    ↓
              emit message #2
                    ↓
              wait 2 sec
                    ↓
              emit message #3
                    ↓
              wait 2 sec
                    ↓
              ...
            
            Defination:- think lets us control the delay between messages and therefore make the traffic pattern more realistic. Artillery supports think for keeping socket.io clients connected without sending during that innterval.

            