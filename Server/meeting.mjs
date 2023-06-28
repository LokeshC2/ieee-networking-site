const { createRoom, getToken } = require('./twilio');

export class Meeting {
  meetingId = null;
  lobby = [];
  participants = {};
  closingTime = null;
  status = 'created';
  meetingName = null;
  startTime = null;
  numShuffles = null;
  shuffleDuration = null;
  host = null;
  constructor(meetingId, meetingName, startTime, numShuffles, shuffleDuration, host) {
    this.meetingId = meetingId;
    this.meetingName = meetingName;
    this.startTime = startTime;
    this.numShuffles = numShuffles;
    this.shuffleDuration = shuffleDuration;
    this.host = host;
    this.closingTime = startTime + numShuffles * shuffleDuration;
    
    setTimeout(() => {
      this.startMeeting();
    }, startTime - Date.now());
  }

  addParticipant(user) {
    const participantId = randomDigits(3);
    const user = new User(participantId, user.name, user.email);
    this.participants[participantId] = user;
  }

  removeParticipant(participantId) {
    delete this.participants[participantId];
  }

  addParticipantToLobby(participantId) {
    this.lobby.push(participantId);
  }

  removeParticipantFromLobby(participantId) {
    this.lobby = this.lobby.filter(id => id !== participantId);
  }

  startMeeting() {
    this.status = 'started';
    this.shuffle();
  }

  shuffle() {
    if (this.status === 'ended' || this.lobby.length === 0) {
      return;
    }
    
    let tempLobby = this.lobby.slice();
    
    while (tempLobby.length > 1) {
      const participantId = tempLobby.pop();
      const match = this.findMatch(participantId, tempLobby);
      if (match) {
        this.room(participantId, match);
      }
    }

    if (tempLobby.length === 1) {
      const participantId = tempLobby.pop();
      this.participants[participantId].history.push(null);
    }

    setTimeout(() => {
      if (this.numShuffles == 0) this.endMeeting();
      else {
        this.numShuffles--;
        this.shuffle();
      }
    }, this.shuffleDuration);
  }

  findNewMatch(participantId) {
    const participant = this.participants[participantId];
    const history = participant.history;
    const available = this.lobby.filter(id => !history.includes(id));
    if (available) return available[0];
    return null;
  }

  repeatMatch() {
    const partnerId = this.lobby.pop();
    return partnerId;
  }


  async room(participantId, partnerId) {
    const roomId = `${this.meetingId}-${participantId}-${partnerId}`;
    const p1 = this.participants[participantId];
    const p2 = this.participants[partnerId];
    await createRoom(roomId);
    p1.joinWithPartner(roomId, partnerId);
    p2.joinWithPartner(roomId, participantId);
  }

  endMeeting() {
    this.status = 'ended';
  }
}

const participantStatus = {
  Lobby: 0,
  Matched: 1,
  Left: 2
}


export class User {
  id = null;
  name = null;
  email = null;
  status = participantStatus.Lobby;
  roomId = null;
  token = null;
  res = null; // response object for sending messages
  history = [];

  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  joinWithPartner(roomId, partnerId) {
    this.roomId = roomId;
    this.token = getToken(roomId, this.id);
    this.history.push(partnerId);
  }

  leaveMeeting() {
    this.roomId = null;
    this.token = null;
  }
}