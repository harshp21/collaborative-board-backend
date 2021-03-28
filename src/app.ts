// importing
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

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

let rooms = [];

// socket connection 
io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('join-room', async ({ userId, username, roomName }) => {

        socket.join(roomName);

        socket.to(roomName).on('canvas-data', (canvasElement) => {
            // const room = rooms.find(room => room.roomName == roomName);
            rooms.map(room => {
                if (room.roomName === roomName)
                    room.canvasElements = canvasElement;
            })
            socket.to(roomName).broadcast.emit("canvas-data", rooms.find(room => room.roomName === roomName));
        })

        socket.to(roomName).on('clear-canvas', () => {
            rooms.map(room => {
                if (room.roomName === roomName)
                    room.canvasElements = [];
            })
            socket.to(roomName).broadcast.emit('clear-canvas');
        })

        socket.to(roomName).on('leave-room', () => {
            removeUserFromRoom();
            socket.to(roomName).emit('room-users', rooms.find(room => room.roomName === roomName))
        })

        socket.on('disconnect', () => {
            removeUserFromRoom()
            socket.to(roomName).emit('room-users', rooms.find(room => room.roomName === roomName))
        })

        const removeUserFromRoom = () => {
            console.log('leave room');
            rooms = rooms.map(room => {
                return room.roomName === roomName ? {
                    ...room,
                    users: room.users.filter(user => user.userId !== userId)
                } : room;
            })
        }

        const room = rooms.find(room => room.roomName === roomName);
        const isUserAlreadyPresent = room && room.users.some(user => user.userId === userId);
        if (!isUserAlreadyPresent) {
            console.log('user joined', roomName, username);

            const isRoomPresent = rooms.some(room => room.roomName === roomName);
            isRoomPresent && rooms.map(room => {
                if (room.roomName === roomName) {
                    room.users.push({ userId, username });
                }
            });

            !isRoomPresent && rooms.push({
                roomName,
                users: [{ userId, username }],
                canvasElements: [],
            })
        }
        io.to(roomName).emit('room-joined', rooms.find(room => room.roomName === roomName));
    })
})