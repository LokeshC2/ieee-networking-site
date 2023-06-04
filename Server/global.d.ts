type participant = {
  name: string
  email: string
}

type participants = {
  [participantId: string]: participant
}

type meeting = {
  status: string
  startTime: number
  shuffles: number
  interval: number
  host: participant
  participants: participants
  lobby: participant[]
}

type meetings = {
  [meetingId: string]: meeting
}

