"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// importing
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
// app config
var app = express_1.default();
dotenv_1.default.config();
var port = process.env.PORT || 5000;
// middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(cors_1.default({
    origin: process.env.REQUEST_ORIGIN
}));
// app listen
var server = app.listen(port, function () { return console.log("listening on port : " + port); });
// registering a socket for server
var io = require('socket.io')(server, {
    cors: {
        origin: process.env.REQUEST_ORIGIN,
        methods: ["GET", "POST"]
    }
});
// socket connection 
io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('canvas-data', function (data) {
        socket.broadcast.emit("canvas-data", data);
    });
});
