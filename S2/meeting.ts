import { createRoom, getToken } from "./twilio";
import { randomDigits } from "./utils";

type MeetingId = string;
type ParticipantId = string;
enum MeetingStatus {
  Created = "created",
  Started = "started",
  Ended = "ended",
}

class ShuffleDetails {
  constructor(
    public shuffleNumber: number,
    public roomId: string,
    public token: string,
    public partnerId: ParticipantId,
  ) { }
}

// PERSISTENT
export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public history: MeetingId[] = [],
  ) { }
}

class ParticipantHistory {
  constructor(
    public shuffleDetails: ShuffleDetails[] = [],
  ) { }
  
  push(shuffleDetails: ShuffleDetails) {
    this.shuffleDetails.push(shuffleDetails);
  }

  shuffledWith(participantId: ParticipantId) {
    return this.shuffleDetails.find((shuffle) => shuffle.partnerId === participantId);
  }
}

export class Participant {
  constructor(
    public participantId: ParticipantId,
    public user: User,
    public shuffleDetails?: ShuffleDetails,
    public history: ParticipantHistory = new ParticipantHistory(),
  ) { }

  joinWithPartner(roomId: string, partnerId: string) {
    this.shuffleDetails = new ShuffleDetails(
      (this.shuffleDetails?.shuffleNumber || 0) + 1,
      roomId,
      getToken(roomId),
      partnerId,
    );
    this.history.push(this.shuffleDetails);
  }

  leaveMeeting() {
    delete this.shuffleDetails;
  }
}

export class Meeting {
  constructor(
    public meetingId: MeetingId,
    public lobby: ParticipantId[] = [],
    public participants: { [key: ParticipantId]: Participant } = {},
    public readonly startTime: Date,
    public readonly closingTime: Date,
    public status: MeetingStatus,
    public meetingName: string,
    public numShuffles: number,
    public shuffleDuration: number,
    public readonly host: User,
  ) {
    this.status = MeetingStatus.Created;
    this.numShuffles = Math.min(Math.floor(numShuffles), 1);
    this.shuffleDuration = Math.min(Math.floor(shuffleDuration), 1);
  }

  addParticipant(user: User) {
    const participantId = randomDigits(3);
    const participant = new Participant(participantId, user);
    this.participants[participantId] = participant;
  }

  removeParticipant(participantId: ParticipantId) {
    this.removeParticipantFromLobby(participantId);
    delete this.participants[participantId];
  }

  addParticipantToLobby(participantId) {
    this.lobby.push(participantId);
  }

  removeParticipantFromLobby(participantId) {
    this.lobby = this.lobby.filter((id) => id !== participantId);
  }

  startMeeting() {
    this.status = MeetingStatus.Created;
    this.shuffle();
  }

  shuffle() {
    if (this.status === "ended" || this.lobby.length === 0) {
      return;
    }

    let tempLobby = this.lobby.slice();

    while (tempLobby.length > 1) {
      const participantId = tempLobby.pop() as ParticipantId;
      const match = this.findMatch(participantId, tempLobby);
      if (match) {
        this.room(participantId, match);
      }
    }

    if (tempLobby.length === 1) {
      const participantId = tempLobby.pop() as ParticipantId;
      let participant = this.participants[participantId];
      participant.leaveMeeting();
    }

    setTimeout(() => {
      if (this.numShuffles == 0) this.endMeeting();
      else {
        this.numShuffles--;
        this.shuffle();
      }
    }, this.shuffleDuration);
  }

  findNewMatch(participantId: ParticipantId, lobby: ParticipantId[]) {
    return lobby.find((partnerId) => {
      !this.participants[participantId].history.shuffledWith(partnerId);
    });
  }

  repeatMatch() {
    const partnerId = this.lobby.pop();
    return partnerId;
  }

  findMatch(participantId, tempLobby: ParticipantId[]) {
    return this.findNewMatch(participantId, tempLobby) || this.repeatMatch();
  }

  async room(participantId: ParticipantId, partnerId: ParticipantId) {
    const roomId = `${this.meetingId}-${participantId}-${partnerId}`;
    const p1 = this.participants[participantId];
    const p2 = this.participants[partnerId];
    await createRoom(roomId);
    p1.joinWithPartner(roomId, partnerId);
    p2.joinWithPartner(roomId, participantId);
  }

  endMeeting() {
    this.status = MeetingStatus.Ended;
  }
}

