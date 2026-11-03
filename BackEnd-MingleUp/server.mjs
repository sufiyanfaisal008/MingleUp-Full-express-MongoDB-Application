import "dotenv/config"
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connect_database } from './libs/mongodb.mjs'
import { authGurdJWT } from "./midleware/jwt/jwt.mjs"
import { UserModel } from "./models/user/index.mjs"
import { authRoutes, postRout, profileRout, chatRouter } from './route/index.mjs'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
})

const port = process.env.port || 5001

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
    profileRout,
    chatRouter(io)
)

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id)

    socket.on("join_room", (chatId) => {
        socket.join(chatId)
    })

    socket.on("send_message", (data) => {
        io.to(data.chatId).emit("receive_message", data)
    })

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id)
    })
})

server.listen(port, () => {
    console.log("Server Runing")
    connect_database()
})