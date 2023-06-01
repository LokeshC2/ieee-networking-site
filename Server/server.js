require("dotenv").config();
const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require('fs');

const { random_digits } = require("./util");
const { findOrCreateRoom, getAccessToken } = require("./twilio");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });
const port = 5000;

// let meeting url be http://localhost:5000/meeting/<meetingId>

const meetings = {};
const participants = {};

// allow cross-origin requests
app.use(cors());
// use the Express JSON middleware
app.use(express.json());

app.route('/test', (req, res) => {
  console.log(req);
  if (req.method === 'POST') {
    console.log(req.body);
    res.send(req.body);
  } else {
    res.send('Hello World!');
  }
})

app.post("/create-meeting", async (req, res) => {
  try {
    // const { meeting, host } = req.body
    const meeting = req.body.meeting;

    const meetingId = random_digits(6);

    meeting.status = "scheduled";
    meeting.matches = [];
    meeting.lobby = [];

    meetings[meetingId] = meeting;

    setTimeout(() => {
      startMeeting(meetingId);
    }, startTime - Date.now());

    setTimeout(() => {
      endMeeting(meetingId);
    }, endTime - Date.now());

    res.send({
      meetingId: meetingId
    });
  }
  catch (error) {
    console.trace(error);
    res.status(500).send("Error creating meeting.");
  }
});

app.post("/join", async (req, res) => {
  try {
    const { meetingId, participant } = req.body;

    const participantId = random_digits(3);
    participant.room = "";
    participant.token = "";
    participant.history = [];

    meetings[meetingId].participants.push(participantId);
    participants[participantId] = participant;

    res.send({
      meeting: meetings[meetingId],
      participantId: participantId,
    });

    console.log(`Participant ${participantId} joined meeting ${meetingId}.`);
    io.to(meetingId).emit("participant-joined", participant);
  }
  catch (error) {
    console.trace(error);
    res.status(500).send("Error joining meeting.");
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join-meeting", (meetingId, participantId) => {
    console.log(`Participant ${participantId} joined meeting ${meetingId}.`);
    socket.join(meetingId);
    meetings[meetingId].lobby.push(participantId);
    participants[participantId].socket = socket;
  });

  socket.on("join-room", (meetingId, participantId) => {
    console.log(`Participant ${participantId} joined room ${participants[participantId].room}.`);
    meetings[meetingId].lobby = meetings[meetingId].lobby.filter(
      (p) => p.id !== participantId
    );
    socket.join(participants[participantId].room);
    socket.emit("room-joined", {
      roomName: participants[participantId].room,
      token: participants[participantId].token,
    });
  });

  socket.on("end-room", (meetingId, participantId) => {
    participants[participantId].room = "";
    participants[participantId].token = "";
    meetings[meetingId].lobby.push(participantId);
    findRoom(meetingId, participantId);
  })

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


function startMeeting(meetingId) {
  meetings[meetingId].status = "started";
  io.to(meetingId).emit("meeting-started");
  console.log(`Meeting ${meetingId} started.`);

  setInterval(() => {
    if (meetings[meetingId].status == "ended") {
      clearInterval(this);
    } else {
      io.to(meetingId).emit("new-shuffle", shuffled(meetings[meetingId].participants));
    }
  }, meetings[meetingId].shuffleInterval * 1000);

  setTimeout(() => {
    endMeeting(meetingId);
  }, meetings[meetingId].details.endTime - Date.now());
}

function endMeeting(meetingId) {
  console.log(`Meeting ${meetingId} ended.`);
  meetings[meetingId].status = "ended";
  io.to(meetingId).emit("meeting-ended");
}

async function findRoom(meetingId, participantId) {
  const participant = participants[participantId];
  const roomName = `${meetingId}-${participantId}-${random_digits(3)}`

  let room;

  if (meetings[meetingId].status != "started") {
    participant.socket.emit("meeting-not-started");
    return;
  }

  const otherParticipant = meetings[meetingId].lobby.find(
    (p) => p.id !== participantId && !p.history.includes(participantId)
  );

  if (!otherParticipant) {
    // wait for other participant
    participant.socket.emit("waiting-for-participant");
    return;
  }

  //remove participants from lobby
  meetings[meetingId].lobby = meetings[meetingId].lobby.filter(
    (p) => p.id !== participantId && p.id !== otherParticipant.id
  );
  
  room = await findOrCreateRoom(roomName);
  console.log(`Room ${roomName} created.`);

  participant.room = room.sid;
  otherParticipant.room = room.sid;
  participant.token = getAccessToken(roomName, participantId);
  otherParticipant.token = getAccessToken(roomName, otherParticipant.id);

  participant.socket.emit("room-found", {
    roomName: roomName,
    token: participant.token,
  });

  otherParticipant.socket.emit("room-found", {
    roomName: roomName,
    token: otherParticipant.token,
  });

  //add to history
  participant.history.push(otherParticipant.id);
  otherParticipant.history.push(participantId);

}