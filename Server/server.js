const { createServer } = require('http');
const { io } = require('socket.io');

const server = createServer();
const socketServer = new io(server);

const meetings = {};


// type meetings = {
//   [meetingId: string]: {
//     host: string,
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
    console.log('Create meeting');

    const meetingId = random_digits(6);
    meetings[meetingId] = {
      host,
      startTime,
      shuffles,
      duration,
      participants: {},
    };

    socket.emit('meeting-created', { meetingId });
  });

  socket.on('join-meeting', ({ meetingId, participant }) => {
    const { name, email } = participant;
    console.log('Join meeting');
    if (!meetings[meetingId]) {
      socket.emit('meeting-not-found');
      return;
    }

    const participantId = random_digits(3);
    meetings[meetingId].participants[participantId] = {
      name,
      email,
      socketId: socket.id,
    };

    socket.emit('meeting-joined', {
      status: meetings[meetingId].status,
      participantId
    });
  });

  socket.on('get-room', ({ meetingId, participantId }) => {
    console.log('Get room');
    if (!meetings[meetingId]) {
      socket.emit('meeting-not-found');
      return;
    }

    if (!meetings[meetingId].participants[participantId]) {
      socket.emit('participant-not-found');
      return;
    }

    socket.emit('room', {
      meetingId,
      participantId,
      room: meetings[meetingId].participants[participantId].room,
      token: meetings[meetingId].participants[participantId].token,
      partner: meetings[meetingId].participants[participantId].partner,
      closingTime: meetings[meetingId].participants[participantId].closingTime,
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
  

  function random_digits(n) {
    return Math.floor(Math.random() * 10 ** n).toString().padStart(n, "0");
  }