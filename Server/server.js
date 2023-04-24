require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

const meetings = {};

// allow cross-origin requests
app.use(cors());
// use the Express JSON middleware
app.use(express.json());

// create the twilioClient
const twilioClient = require("twilio")(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

const findOrCreateRoom = async (roomName) => {
  try {
    // see if the room exists already. If it doesn't, this will throw
    // error 20404.
    await twilioClient.video.v1.rooms(roomName).fetch();
  } catch (error) {
    // the room was not found, so create it
    if (error.code == 20404) {
      await twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        type: "go",
      });
    } else {
      // let other errors bubble up
      throw error;
    }
  }
};

const getAccessToken = (roomName, participantId) => {
  // create an access token
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    // generate a random unique identity for this participant
    { identity: participantId }
  );
  // create a video grant for this specific room
  const videoGrant = new VideoGrant({
    room: roomName,
  });

  // add the video grant
  token.addGrant(videoGrant);
  // serialize the token and return it
  return token.toJwt();
};

app.post('/test', (req, res) => {
  console.log(req);
  res.send(req.body);
})

app.post("/create-meeting", async (req, res) => {
  // return 400 if the request has an empty body or no meetingName
  if (!req.body || !req.body.meetingName) {
    return res.status(400).send("Must include meetingName argument.");
  }
  const meetingName = req.body.meetingName;
  const meetingId = uuidv4();

  meetings[meetingId] = {
    meetingName: meetingName,
    participants: [],
    rooms: [],
    lobby: "",
    details: req.body.details
  };

  res.send({
    meetingId: meetingId
  });
});

app.post("/join", async (req, res) => {
  let roomName;
  let token;

  // return 400 if the request has an empty body or no meetingId
  if (!req.body || !req.body.meetingId) {
    return res.status(400).send("Must include meetingId argument.");
  }
  const meetingId = req.body.meetingId;

  // return 404 if the meetingId is not found
  const meeting = meetings[meetingId];
  if (!meeting) {
    return res.status(404).send("Meeting not found.");
  }

  // return 400 if the request has an empty body or no participant
  if (!req.body || !req.body.participant) {
    return res.status(400).send("Must include participant argument.");
  }

  const participant = req.body.participant;

  // if participant sends a request with a participantId, check if they are already in the meeting and return their token
  if (participant.id && meeting.participants.length > 0 ) {
    let p = meeting.participants.find(participant => participant.id === participant.id);
    if (p) {
      res.send({
        participantId: p.id,
        roomName: p.roomName,
        token: getAccessToken(p.roomName, participant.id),
        details: meetings[meetingId].details
      });
      return;
    }
  }

  if (meetings[meetingId].lobby) {
    // if lobby is not empty, join the first room in the lobby
    roomName = meetings[meetingId].lobby;
    meetings[meetingId].lobby = "";
  } else {
    // if lobby is empty, create a new room
    roomName = uuidv4();
    meetings[meetingId].lobby = roomName;
  }

  // find or create a room with the given roomName
  try {
    findOrCreateRoom(roomName);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error creating room.");
  }

  //generate a new participantId
  participant.id = uuidv4();

  // generate an Access Token for a participant in this room
  token = getAccessToken(roomName, participant.id);
  
  //update participant with roomName and token
  participant.roomName = roomName;
  participant.token = token;

  //add participant to participants array
  meetings[meetingId].participants.push(participant);

  res.send({
    participantId: participant.id,
    token: token,
    roomName: roomName,
    details: meetings[meetingId].details
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});