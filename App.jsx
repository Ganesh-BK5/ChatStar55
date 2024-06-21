import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Box, Button, Container, Stack, TextField, Typography } from "@mui/material";

const App = () => {
  const socket = useMemo(() => io("http://localhost:3000", {
    withCredentials: true
  }), []);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (room) {
      socket.emit("message", { message, room });
      setMessage("");
    } else {
      alert("Please enter a room to send a message");
    }
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    if (roomName) {
      socket.emit("join-room", roomName);
      setRoom(roomName);
      setRoomName("");
    } else {
      alert("Please enter a room name to join");
    }
  };

  useEffect(() => {
    // Listen for the 'connect' event to confirm connection
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log("connected", socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log(data);
      setMessages((messages) => [...messages, data]);
    });

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: 200 }} />

      <Typography variant="h6" component="div" gutterBottom>
        Socket ID: {socketID}
      </Typography>

      <form onSubmit={joinRoomHandler}>
        <Typography variant="h5">Join Room</Typography>
        <TextField
          value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value);
          }}
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
        />
        <Button variant="contained" type="submit" color="primary" sx={{ mt: 2 }}>
          Join
        </Button>
      </form>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <TextField
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          id="outlined-basic"
          label="Message"
          variant="outlined"
        />

        <TextField
          value={room}
          onChange={(e) => {
            setRoom(e.target.value);
          }}
          id="outlined-basic"
          label="Room"
          variant="outlined"
          sx={{ ml: 2 }}
        />
        <Button variant="contained" type="submit" color="primary" sx={{ mt: 2 }}>
          Send
        </Button>
      </form>

      <Stack sx={{ marginTop: "1rem" }}>
        {messages.map((m, i) => (
          <Typography key={i} variant="h6" component="div" gutterBottom>
            {m}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default App;
