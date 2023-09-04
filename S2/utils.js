function randomDigits(digits) {
  return Math.floor(Math.random() * Math.pow(10, digits)).toString()
}

function meetingIdValidator(meetings) {
  return (req, res, next) => {
    if (req.method === 'GET') req.meetingId = req.query.meetingId;
    if (req.method === 'POST') req.meetingId = req.body.meetingId;

    if (req.meetingId) {
      req.meetingId = req.meetingId.toLowerCase();
      if (!req.meetingId.match(/^[a-z0-9]{6}$/)) {
        res.status(400).json({ error: 'Invalid meetingId' });
        return;
      }
      if (!meetings[req.meetingId]) {
        res.status(404).json({ error: 'Meeting not found' });
        return;
      }
      if (meetings[req.meetingId].status === 'ended') {
        res.status(400).json({ error: 'Meeting has ended' });
        return;
      }
    }
    next();
  }
}

function participantIdValidator(meetings) {
  return (req, res, next) => {
    if (req.method === 'GET') req.participantId = req.query.participantId;
    if (req.method === 'POST') req.participantId = req.body.participantId;

    if (req.participantId) {
      req.participantId = req.participantId.toLowerCase();
      if (!req.participantId.match(/^[a-z0-9]{6}$/)) {
        res.status(400).json({ error: 'Invalid participantId' });
        return;
      }
      if (!meetings[req.meetingId].participants[req.participantId]) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }
    }
    next();
  }
}

module.exports = {
  randomDigits,
  meetingIdValidator,
  participantIdValidator,
};