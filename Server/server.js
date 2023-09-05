require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createRoom, getToken } = require('./twilio');
const { randomDigits } = require('./utils');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const meetings = {};

app.get('/health', (req, res) => res.send('OK'));

app.get('/meetings', (req, res) => {
  res.json(Object.keys(meetings));
});

app.get('/meeting', (req, res) => {
  const { meetingId } = req.query;

  if (!meetings[meetingId]) {
    res.status(404).send('Meeting not found');
    return;
  }
  let meeting = meetings[meetingId];
  let participantIds = Object.keys(meeting.participants);
  return res.json({ ...meeting, participants: participantIds });
});

app.post('/create', (req, res) => {
  const {
    meetingName, // string
    startTime, // timestamp
    numShuffles, // int
    shuffleDuration, // int (ms)
    host // { name: string, email: string}
  } = req.body;

  const meetingId = randomDigits(6);
  const meeting = {
    status: 'created',
    meetingName,
    startTime,
    numShuffles,
    shuffleDuration,
    host,
    participants: {},
    lobby: [],
    partners: [],
    closingTime: startTime + numShuffles * shuffleDuration,
  };

  meetings[meetingId] = meeting;

  setTimeout(() => {
    startMeeting(meetingId);
  }, startTime - Date.now());

  res.json({ meetingId });
  console.log(`Meeting ${meetingId} created by ${host.name}`);
});

app.post('/join', async (req, res) => {
  const {
    meetingId, // string
    participant, // { name: string, email: string }
  } = req.body;

  if (!meetings[meetingId]) {
    res.status(404).send('Meeting not found');
    return;
  }

  if (meetings[meetingId].status === 'ended') {
    res.status(400).send('Meeting has ended');
    return;
  }

  const participantId = randomDigits(3);

  meetings[meetingId].participants[participantId] = {
    ...participant,
    roomId: null,
    token: null,
    history: [],
  };


  if (meetings[meetingId].status === 'started' && meetings[meetingId].lobby.length > 0) {

    const partnerId = meetings[meetingId].lobby.pop();

    const { roomId, token1, token2 } = await Room(meetingId, participantId, partnerId);

    res.json({ meetingId, participantId, partnerId, roomId, token: token1, status: 'matched', closingTime: meetings[meetingId].closingTime });
    if (meetings[meetingId].participants[partnerId].res) {
      meetings[meetingId].participants[partnerId].res.write(
        'data: ' + JSON.stringify({ meetingId, participantId, partnerId, roomId, token: token2, status: 'matched' }) + '\n\n'
      );
    }

    console.log(`Participant ${participantId} joined meeting ${meetingId} with ${partnerId}`);

  } else {

    meetings[meetingId].lobby.push(participantId);
    res.json({ meetingId, participantId, status: 'waiting', closingTime: meetings[meetingId].closingTime });
    console.log(`Participant ${participantId} joined lobby ${meetingId}`);

  }
});

app.get('/match/:meetingId/:participantId', (req, res) => {
  const {
    meetingId, // string
    participantId, // string
  } = req.params;

  if (!meetings[meetingId]) {
    res.status(404).send('Meeting not found');
    return;
  }

  if (!meetings[meetingId].participants[participantId]) {
    res.status(404).send('Participant not found');
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (meetings[meetingId].participants[participantId].res) {
    meetings[meetingId].participants[participantId].res.end();
    delete meetings[meetingId].participants[participantId].res;
  }

  meetings[meetingId].participants[participantId].res = res;

  req.on('close', () => {
    console.log(`Participant ${participantId} disconnected from sse ${meetingId}`);
    if (meetings[meetingId]?.participants[participantId]?.res) {
      meetings[meetingId].participants[participantId].res.end();
      delete meetings[meetingId].participants[participantId].res;
    }
  });

  console.log(`Participant ${participantId} connected to sse ${meetingId}`);
});

app.post('/leave', (req, res) => {
  const {
    meetingId, // string
    participantId, // string
  } = req.body;

  if (!meetings[meetingId]) {
    res.status(404).send('Meeting not found');
    return;
  }

  if (!meetings[meetingId].participants[participantId]) {
    res.status(404).send('Participant not found');
    return;
  }

  meetings[meetingId].lobby = meetings[meetingId].lobby.filter(id => id !== participantId);

  if (meetings[meetingId].participants[participantId].res) {
    meetings[meetingId].participants[participantId].res.end();
    delete meetings[meetingId].participants[participantId].res;
  }

  delete meetings[meetingId].participants[participantId];

  res.send('OK');
  console.log(`Participant ${participantId} left meeting ${meetingId}`);
});

app.post('/reconnect', (req, res) => {
  const {
    meetingId, // string
    participantId, // string
  } = req.body;

  if (!meetings[meetingId]) {
    res.status(404).send('Meeting not found');
    return;
  }

  if (!meetings[meetingId].participants[participantId]) {
    res.status(404).send('Participant not found');
    return;
  }

  const { roomId, token } = meetings[meetingId].participants[participantId];

  res.json({ meetingId, participantId, roomId, token });
  console.log(`Participant ${participantId} reconnected to meeting ${meetingId}`);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

async function Room(meetingId, participantId, partnerId) {
  meetings[meetingId].partners.push([participantId, partnerId]);
  const roomName = `${meetingId}-${participantId}-${partnerId}`;
  const room = await createRoom(roomName);
  const roomId = room.sid;
  const token1 = getToken(participantId, roomId);
  const token2 = getToken(partnerId, roomId);
  meetings[meetingId].participants[participantId].roomId = roomId;
  meetings[meetingId].participants[participantId].token = token1;
  meetings[meetingId].participants[partnerId].roomId = roomId;
  meetings[meetingId].participants[partnerId].token = token2;
  meetings[meetingId].participants[participantId].history.push(partnerId);
  meetings[meetingId].participants[partnerId].history.push(participantId);
  meetings[meetingId].lobby = meetings[meetingId].lobby.filter(id => id !== participantId && id !== partnerId);
  return { roomId, token1, token2 };
}

function startMeeting(meetingId) {
  meetings[meetingId].status = 'started';
  console.log(`Meeting ${meetingId} started`);

  const { numShuffles, shuffleDuration } = meetings[meetingId];

  for (let i = 0; i < numShuffles; i++) {
    setTimeout(() => {
      shuffle(meetingId);
    }, i * shuffleDuration);
  }

  setTimeout(() => {
    endMeeting(meetingId);
  }, numShuffles * shuffleDuration);
}

async function shuffle(meetingId) {
  meetings[meetingId].partners = [];
  const lobby = Object.keys(meetings[meetingId].participants);

  for (const participantId of meetings[meetingId].lobby) {
    if (!lobby.includes(participantId)) {
      lobby.push(participantId);
    }
  }

  while (lobby.length > 1) {
    const participantId = lobby.pop();
    const partnerId = lobby.pop();
    meetings[meetingId].lobby = meetings[meetingId].lobby.filter(id => id !== participantId && id !== partnerId);

    const { roomId, token1, token2 } = await Room(meetingId, participantId, partnerId);

    if (meetings[meetingId].participants[participantId].res) {
      meetings[meetingId].participants[participantId].res.write(
        'data: ' + JSON.stringify({ meetingId, participantId, partnerId, roomId, token: token1 }) + '\n\n'
      );
    }
    if (meetings[meetingId].participants[partnerId].res) {
      meetings[meetingId].participants[partnerId].res.write(
        'data: ' + JSON.stringify({ meetingId, participantId: partnerId, partnerId: participantId, roomId, token: token2 }) + '\n\n'
      );
    }
    console.log(`Participants ${participantId} and ${partnerId} paired in meeting ${meetingId}`);
  }
}

function endMeeting(meetingId) {
  meetings[meetingId].status = 'ended';
  Object.keys(meetings[meetingId].participants).forEach(pid => {
    if (meetings[meetingId].participants[pid].res) {
      meetings[meetingId].participants[pid].res.write('event: end\n\n');
      meetings[meetingId].participants[pid].res.status(204)
      delete meetings[meetingId].participants[pid].res;
    }
  });
  console.log(`Meeting ${meetingId} ended`);
}