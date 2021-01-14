// importing
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';

// app config
const app = express();
dotenv.config();
const port = process.env.PORT || 5000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.REQUEST_ORIGIN
}))

// app listen
const server = app.listen(port, () => console.log(`listening on port : ${port}`));

// registering a socket for server
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.REQUEST_ORIGIN,
        methods: ["GET", "POST"]
    }
});

// socket connection 
io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('canvas-data', (data) => {
        socket.broadcast.emit("canvas-data", data);
    })
})