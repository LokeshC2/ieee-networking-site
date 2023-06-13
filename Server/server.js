const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const socketServer = new Server(httpServer, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5000;

const meetings = {};

// type meetings = {
//   [meetingId: string]: {
//     startTime: number,
//     shuffles: number,
//     duration: number,
//     participants: {
//       [participantId: string]: {
//         name: string,
//         email: string,
//         socketId: string,
//         room: {
//           roomId: string
//           token: string,
//           partner: string,
//           closingTime: number,
//         }
//       }
//     }
//   }
// }


socketServer.on('connection', (socket) => {
  console.log('User connected');
  socket.emit('connected');

  socket.on('create-meeting', ({ host, startTime, shuffles, duration }) => {
    try {
      console.log('Create meeting');

      const now = Date.now();

      const meetingId = random_digits(6);
      meetings[meetingId] = {
        status: 'scheduled', // 'scheduled' | 'started' | 'ended
        host,
        startTime,
        shuffles,
        duration,
        participants: {},
      };

      setTimeout(startMeeting, startTime - now, meetingId, startTime);

      setTimeout(() => {
        meetings[meetingId].status = 'ended';
        socketServer.to(meetingId).emit('meeting-ended');
      }, startTime + shuffles * duration - now);

      socket.emit('meeting-created', meetingId);

    } catch (error) {
      socket.emit('error', error.message);
      return;
    }
  });

  socket.on('join-meeting', ({ meetingId, participant: { name, email } }) => {
    // VALIDATE INPUTS

    try {
      console.log('Join meeting');
      if (!meetings[meetingId]) {
        socket.emit('meeting-not-found');
        throw new Error('Meeting not found');
      }

      const participantId = random_digits(3);
      meetings[meetingId].participants[participantId] = {
        name,
        email,
        socketId: socket.id,
      };

      socket.join(meetingId);
      socket.join(participantId);

      socket.emit('meeting-joined', {
        status: meetings[meetingId].status,
        participantId
      });

    } catch (error) {
      socket.emit('error', error.message);
      return;
    }
  });

  socket.on('get-room', ({ meetingId, participantId }) => {

    try {
      console.log('Get room');
      if (!meetings[meetingId]) {
        socket.emit('meeting-not-found');
        throw new Error('Meeting not found');
      }

      if (!meetings[meetingId].participants[participantId]) {
        socket.emit('participant-not-found');
        throw new Error('Participant not found');
      }

      socket.emit('room', meetings[meetingId].participants[participantId].room);

    } catch (error) {
      socket.emit('error', error.message);
      return;
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

function random_digits(n) {
  return Math.floor(Math.random() * 10 ** n).toString().padStart(n, "0");
}

function startMeeting(meetingId, startTime) {
  if (meetings[meetingId] === undefined) {
    throw new Error('Meeting not found');
  }
  meetings[meetingId].status = 'started';
  socketServer.to(meetingId).emit('meeting-started');
  for (let i = 0; i < meetings[meetingId].shuffles; i++) {
    setTimeout(
      shuffle,
      i * meetings[meetingId].duration,
      meetingId,
      startTime + (i + 1) * meetings[meetingId].duration
    );
  }
  setTimeout(endMeeting, meetings[meetingId].shuffles * meetings[meetingId].duration, meetingId);
}

function shuffle(meetingId, closingTime) {

  const participants = Object.keys(meetings[meetingId].participants);
  const shuffled = participants.sort(() => Math.random() - 0.5);

  for (let i = 0; i < (shuffled.length-1)/2; i++) {

    const roomId = random_digits(6);
    const participantId = shuffled.pop();
    const partnerId = shuffled.pop();

    meetings[meetingId].participants[participantId].room = {
      roomId,
      token: random_digits(6),
      partner: partnerId,
      closingTime,
    };

    socketServer.to(participantId).emit('assigned-room', meetings[meetingId].participants[participantId].room);

    meetings[meetingId].participants[partnerId].room = {
      roomId,
      token: random_digits(6),
      partner: participantId,
      closingTime,
    };

    socketServer.to(partnerId).emit('assigned-room', meetings[meetingId].participants[partnerId].room);
  }

  if (shuffled.length === 1) {
    const participantId = shuffled.pop();
    meetings[meetingId].participants[participantId].room = {
      roomId: null,
      token: null,
      partner: null,
      closingTime,
    };
    socketServer.to(participantId).emit('no-partner', closingTime);
  }

}

function endMeeting(meetingId) {
  meetings[meetingId].status = 'ended';
  socketServer.to(meetingId).emit('meeting-ended');
}


httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});