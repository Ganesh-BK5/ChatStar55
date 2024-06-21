import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;
const secretKeyJWT = "dfddfdee";

// Setting up CORS for Express
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));

// Setting up cookie-parser
app.use(cookieParser());

// Creating HTTP server
const server = createServer(app);

// Setting up Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware to authenticate socket connections
io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res || {}, (err) => {
        if (err) return next(err);
        
        const token = socket.request.cookies.token;
        if (!token) return next(new Error("Authentication Error"));

        try {
            const decoded = jwt.verify(token, secretKeyJWT);
            socket.request.user = decoded; // Attach decoded user info to the request
            next();
        } catch (err) {
            return next(new Error("Authentication Error"));
        }
    });
});

io.on("connection", (socket) => {
    console.log("User Connected!!", socket.id);

    socket.on("message", ({ room, message }) => {
        console.log({ room, message });
        io.to(room).emit("receive-message", message);
    });

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected!!", socket.id);
    });
});

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/login', (req, res) => {
    const token = jwt.sign({ _id: "dfddfdefdfdf" }, secretKeyJWT);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" }).json({
        message: "Login Success"
    });
});

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
