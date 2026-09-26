import "dotenv/config"
import express from 'express'
import { authRoutes, postRout, profileRout } from './route/index.mjs'
const app = express()
const port = process.env.port || 5001
import cors from 'cors'
import { connect_database } from './libs/mongodb.mjs'
import { authGurdJWT } from "./midleware/jwt/jwt.mjs"
import { UserModel } from "./models/user/index.mjs"

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

app.get('/', (req, res, next) => {
    res.send({
        message: 'Runing Server...'
    })
})

app.get("/users", async (req, res, next) => {
    const allUsers = await UserModel.find()
    res.send({
        message: "users fetched",
        data: allUsers
    })
})

app.use('/api/v1',
    authRoutes,
    authGurdJWT,
    postRout,
    profileRout
)

app.listen(port, () => {
    console.log("Server Runing")
    connect_database()
})