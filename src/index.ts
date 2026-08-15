
import express , {type Express, type NextFunction, type Request, type Response} from 'express'
import connectDB from './config/db.ts';
import { connectRedis } from './config/redis.ts';
const app: Express = express();
import initializeServer from './socket/index.ts';
import { createServer } from 'node:http';
import { Socket } from 'socket.io';
import verifyToken from './middlewares/auth.middleware.ts';

connectDB();
// connectRedis();

const httpServer = createServer(app);
const io = initializeServer(httpServer); // I don't need to mention the type here, typescript will automatically infers io as socketIoServer
// infer means typescript will automatically understand the type without mentioning it explicitly

app.use(express.json()) // convert the incoming json into object

// Routers
import healthRouter from './routes/healthCheck.routes.ts'
import authRoutes from './routes/auth.routes.ts'
import userRoutes from './routes/user.routes.ts'

app.use('/',healthRouter)
app.use('/auth', authRoutes);
app.use('/api/', userRoutes)

httpServer.listen(5009, () => {
    console.log(`Server is running at http://localhost:5009`)
})

