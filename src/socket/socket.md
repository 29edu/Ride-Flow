
# Socket

    ## io.on
    io.on("connection", (socket) =>)
    io represent all connected clients and socket represent one particular client connection

                        io
              Socket.IO Server
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
     socket A     socket B     socket C
     Browser A    Browser B    Browser C

    Each connection recevives its own socket.id

    We can use app.listen() instead of the http.createServer(app)

    eg:-

    const app = express()
    const httpServer = app.listen(5009)
    const io = new Server(httpServer)

    But we cannot do
    const httpServer = createServer(app)
    const io = new Server(httpServer)

    app.listen(5009);

    Because:- createServer(app) creates server A while app.listen(5009) creates another server B internally

                        Express app
                   /           \
                  /             \
                 ▼               ▼
           HTTP Server A    HTTP Server B
                 │               │
             Socket.IO       app.listen()
                 │               │
        NOT listening        Port 5009

    Now if i try to connect from client, it connects with localhost:5009 (server B) but socket.io lives on Server A. 
    So socket.io don't receive any information

    Also I cannot listen both server A and server B at same port (5009)

    app.listen(5009)
    httpServer.listen(5009)

    This is wrong.


    ## Server

    import { Server } from "socket.io"
    it means we are importing Server class from socket.io

    const io = new Server(httpServer) -> It create a socket.io server Object and attach it to this existing Node HTTP server.

    socket.io support this (new Server(httpServer)) constrcutor form where httpServer is the Node HTTP server.

    After creating the Object of socket.io, now httpServer can support

    Normal HTTP
    POST /login
    GET /users
    
            AND
    
    Socket.IO communication
    connection
    chat-message
    driver-location
    
    ## io.on("connection")

    io.on(...) -> It means Listen for an event on this socket.io server.
    Socket.io server objects use an event-based model and the server emits a "connection" event whenever a new client successfully connects.

    io.on("connection", ...) -> It means whenever a new socket.io client connects, execute this function.

    Socket.IO server
      │
      │ waiting...
      │
      │ waiting...
      │
      ▼
    No client connected

    NOthing inside this function runs yet

    IN the frontend (React) ->
    It will do something like io("http://localhost:5009");
    Now the clients starts establishing a socket.io connection with the server. At the low level Engine.io is resposible for establishing that connection.

    Everytime when a new User get connected, socket.io connection creates a new server-side socket object, but sending new messages over an exisiting user doesn't create any new object. 

    io.on("connection", (socket) => {

        socket.on("chat message", (msg) => {
            console.log(msg)
        })
    })

    ## Socket

    socket is an object which is passed as a callback function and socket.io creates this object automatically when a new user get connected. WE don't need to create automatically

    
