"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var rooms = [];
// socket connection 
io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('join-room', function (_a) {
        var userId = _a.userId, username = _a.username, roomName = _a.roomName;
        return __awaiter(void 0, void 0, void 0, function () {
            var removeUserFromRoom, room, isUserAlreadyPresent, isRoomPresent;
            return __generator(this, function (_b) {
                socket.join(roomName);
                socket.to(roomName).on('canvas-data', function (canvasElement) {
                    // const room = rooms.find(room => room.roomName == roomName);
                    rooms.map(function (room) {
                        if (room.roomName === roomName)
                            room.canvasElements = canvasElement;
                    });
                    socket.to(roomName).broadcast.emit("canvas-data", rooms.find(function (room) { return room.roomName === roomName; }));
                });
                socket.to(roomName).on('clear-canvas', function () {
                    rooms.map(function (room) {
                        if (room.roomName === roomName)
                            room.canvasElements = [];
                    });
                    socket.to(roomName).broadcast.emit('clear-canvas');
                });
                socket.to(roomName).on('leave-room', function () {
                    removeUserFromRoom();
                    socket.to(roomName).emit('room-users', rooms.find(function (room) { return room.roomName === roomName; }));
                });
                socket.on('disconnect', function () {
                    removeUserFromRoom();
                    socket.to(roomName).emit('room-users', rooms.find(function (room) { return room.roomName === roomName; }));
                });
                removeUserFromRoom = function () {
                    console.log('leave room');
                    rooms = rooms.map(function (room) {
                        return room.roomName === roomName ? __assign(__assign({}, room), { users: room.users.filter(function (user) { return user.userId !== userId; }) }) : room;
                    });
                };
                room = rooms.find(function (room) { return room.roomName === roomName; });
                isUserAlreadyPresent = room && room.users.some(function (user) { return user.userId === userId; });
                if (!isUserAlreadyPresent) {
                    console.log('user joined', roomName, username);
                    isRoomPresent = rooms.some(function (room) { return room.roomName === roomName; });
                    isRoomPresent && rooms.map(function (room) {
                        if (room.roomName === roomName) {
                            room.users.push({ userId: userId, username: username });
                        }
                    });
                    !isRoomPresent && rooms.push({
                        roomName: roomName,
                        users: [{ userId: userId, username: username }],
                        canvasElements: [],
                    });
                }
                io.to(roomName).emit('room-joined', rooms.find(function (room) { return room.roomName === roomName; }));
                return [2 /*return*/];
            });
        });
    });
});
