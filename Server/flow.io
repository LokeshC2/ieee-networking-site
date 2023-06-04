loadPage('home')

let meetingID = POST ('/create-meeting', {
  meeting: {
    host: {
      name: 'John Doe',
      email: 'x@example.com',
    },
    startTime: 1234567890,
    shuffles: 3,
    duration: 60,
  }
})

let {meeting, participantId} = POST ('/join', {
  meetingId: '123456',
  participant: {
    name: 'John Doe',
    email: 'x@example.com',
  }
})

SOCKET ('/')

<--- "connection"

---> "connected" <--- "join-meeting", {meetingId: '123456', participant : {name: "u1", email: "u1@example.com"}}

---> "meeting-joined", {status: 'waiting' | 'ended'}   |   "joined-meeting", {status: "in-progress", roomName: "room1234", token: "token1234"}

// if meeting in progress and roomName and token, try joining room with token

// ---> "ready-change-room", {interval: 1818118181}

// <--- "ready" // push to lobby

---> "get-room", {meetingId, participantId}




