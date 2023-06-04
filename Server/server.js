require('dotenv').config();
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const io = require('socket.io');

const { findOrCreateRoom, getAccessToken } = require('./twilio');

// const origin = 'http://localhost:5173';
const origin = '*';
const port = 5000;

const app = express();
const httpServer = createServer(app);
app.use(cors({ origin: origin }));
app.use(express.json());
const socketServer = new io.Server(httpServer, { cors: { origin: origin, methods: ['GET', 'POST'] } });

const meetings = {};

app.post('/create-meeting', async (req, res) => {
  try {
    const meeting = req.body.meeting;
    const {
      startTime,
      shuffles,
      interval,
      host
    } = meeting;
    const meetingId = random_digits(6);

    meeting.status = 'scheduled';
    meeting.participants = {};
    meeting.lobby = [];

    meetings[meetingId] = meeting;

    const now = Date.now();

    setTimeout(() => {
      openLobby(meetingId);
    }, startTime - 10 * 1000 - now);

    for (let i = 0; i < meeting.shuffles; i++) {
      setTimeout(() => {
        shuffle(meetingId, startTime - now + i * interval);
      }, startTime - now + i * interval - 1000);
    }

    setTimeout(() => {
      startMeeting(meetingId);
    }, startTime - now - 1000);

    setTimeout(() => {
      endMeeting(meetingId);
    }, startTime - now + meeting.shuffles * meeting.interval);

    res.send({
      meetingId: meetingId
    });

  } catch (error) {
    console.trace(error);
    res.status(500).send('Error creating meeting.');
  }
})

app.post('/join-meeting', async (req, res) => {
  try {
    const meetingId = req.body.meetingId;
    const name = req.body.participant.name;

    const participantId = random_digits(3);
    const participant = {
      name: name,
      room: null,
      token: null,
      history: []
    };

    const meeting = meetings[meetingId];
    if (!meeting) {
      throw new Error('Meeting not found.');
    }

    meeting.participants[participantId] = participant;

    res.send({
      meetingId: meetingId,
      participantId: participantId
    });

  } catch (error) {
    console.trace(error);
    res.status(500).send('Error joining meeting.');
  }
})

socketServer.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('connected');

  socket.on('join-meeting', async (meetingId, participantId) => {
    try {
      const meeting = meetings[meetingId];
      if (!meeting) {
        throw new Error('Meeting not found.');
      }

      const participant = meeting.participants[participantId];
      if (!participant) {
        throw new Error('Participant not found.');
      }

      socket.join([meetingId, participantId]);

      meeting.lobby.push(participantId);

      socket.emit('joined-meeting', {
        meetingId: meetingId,
        participantId: participantId,
        meeting: meeting
      });

      socket.to(meetingId).emit('participant-joined', {
        participantId: participantId,
        participant: participant
      });

    } catch (error) {
      console.trace(error);
      socket.emit('error', error.message);
    }
  });

  socket.on('check-update', async (meetingId, participantId) => {
    try {
      const meeting = meetings[meetingId];
      if (!meeting) {
        throw new Error('Meeting not found.');
      }

      const participant = meeting.participants[participantId];
      if (!participant) {
        throw new Error('Participant not found.');
      }

      socket.emit('update', {
        meetingId: meetingId,
        participantId: participantId,
        status: meeting.status,
        room: participant.room,
        token: participant.token
      });
    } catch (error) {
      console.trace(error);
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

function openLobby(meetingId) {
  meetings[meetingId].status = 'started - waiting for participants';
  socketServer.to(meetingId).emit('meeting-started');
}

function startMeeting(meetingId) {
  meetings[meetingId].status = 'started - in progress';
  socketServer.to(meetingId).emit('meeting-started');
}

function endMeeting(meetingId) {
  meetings[meetingId].status = 'ended';
  socketServer.to(meetingId).emit('meeting-ended');
}

async function shuffle(meetingId) {
  const meeting = meetings[meetingId];
  const lobby = meeting.lobby;
  const participants = meeting.participants;
  const shuffled = lobby.sort(() => Math.random());

  for (let i = 0; i < shuffled.length; i++) {
    const participantId = shuffled[i];
    const participant = participants[participantId];
    const roomName = random_digits(3);
    participant.room = await findOrCreateRoom(roomName);
    participant.token = getAccessToken(meetingId, participantId);
    socketServer.to(participantId).emit('update', {
      newRoom: participant.room,
      newToken: participant.token,
      changeTime: Date.now()
    });
  }
}

function random_digits(n) {
  return Math.floor(Math.random() * 10 ** n).toString().padStart(n, "0");
}

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});