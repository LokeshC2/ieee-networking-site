const { spawn } = require('child_process');
const fetch = require('node-fetch');

// Function to create a meeting
async function createMeeting() {
  try {
    const createData = {
      meetingName: 'Test Meeting',
      startTime: Date.now() + 10000, // Start the meeting 5 seconds from now
      numShuffles: 4,
      shuffleDurationSec: 20,
      host: { name: 'Host User', email: 'host@example.com' }
    };

    const response = await fetch('http://localhost:5000/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`Meeting created successfully. Meeting ID: ${result.meetingId}`);
      return result.meetingId;
    } else {
      console.error(`Failed to create meeting. ${response.status}: ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error('Error creating meeting:', error.message);
    return null;
  }
}

createMeeting().then(meetingId => {
  // Spawn member join requests (Users 2 to 9) with a delay of 3 seconds between each
  for (let i = 1; i <= 7; i++) {
    setTimeout(() => {
      const proc = spawn('node', ['simulateUser.js', i.toString(), meetingId]);
      proc.stdout.on('data', data => {
        console.log(`User ${i} stdout: ${data}`);
      });
      proc.stderr.on('data', data => {
        console.error(`User ${i} stderr: ${data}`);
      });
      proc.on('close', code => {
        console.log(`User ${i} exited with code ${code}`);
      });
      console.log(`User ${i} requested to join meeting`);
    }, i * 3000);
  }
});
