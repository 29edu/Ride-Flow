
import express from 'express'
import { connectDB } from './config/db.js'

const app = express()
app.use(express())

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`)
})