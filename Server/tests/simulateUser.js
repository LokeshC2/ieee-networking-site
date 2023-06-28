const fetch = require('node-fetch');
const EventSource = require('eventsource');

const participantName = process.argv[2];
const meetingId = process.argv[3];

// Function to join a meeting
async function joinMeeting() {
  try {
    const joinData = {
      meetingId,
      participant: { name: `User ${participantName}`, email: `user${participantName}@example.com` }
    };

    const {
      participantId,
      closingTime,
    } = await fetch('http://localhost:5000/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(joinData)
    }).then(response => response.json());

    console.log(`Participant ${participantId} joined lobby ${meetingId}`);

    return {
      meetingId,
      participantId,
      closingTime
    }
  } catch (error) {
    console.error('Error joining meeting:', error.message);
    return null;
  }
}

joinMeeting().then(data => {
  const eventSource = new EventSource(`http://localhost:5000/match/${data.meetingId}/${data.participantId}`);

  // Event listener for SSE messages
  eventSource.onmessage = event => {
    console.log('SSE Message received:', event.data);
    // Handle the SSE message as needed
  };

  // Event listener for SSE errors
  eventSource.onerror = error => {
    console.error('SSE Error:', error);
    // Handle the SSE error as needed
  };

  eventSource.addEventListener('end', () => {
    eventSource.close();
    console.log('SSE connection closed');
  });
});