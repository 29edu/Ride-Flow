
import express , {type Express, type Request, type Response} from 'express'
import connectDB from './config/db.ts';
const app: Express = express();

connectDB();

// Routing
app.use(express.json()) // convert the incoming json into object


async function init(): Promise<void> {
    // Import the needed libraries.
    await google.maps.importLibrary('maps');

    // Access the map.
    const mapElement = document.querySelector('gmp-map')!;
    // Access the underlying map object.
    const innerMap = mapElement.innerMap;

    console.log({ mapElement, innerMap });
}

void init();

import healthRouter from './routes/healthCheck.routes.ts'
import authRoutes from './routes/auth.routes.ts'
app.use('/',healthRouter)
app.use('/auth', authRoutes)

app.get('/', (req : Request, res: Response) => {
    res.send('hello world')
});

app.listen(5005, () => {
    console.log(`Server is running at http://localhost:5005`);
})

