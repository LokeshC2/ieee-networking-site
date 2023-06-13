<script>
  export let meetingId;
  export let participantId;

	// Connect to socket.io server
	const socket = io('http://localhost:5000');

  socket.on('connect', () => {
    console.log('Connected to socket.io server');
    socket.emit('join-meeting', {
      meetingId,
      participantId
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket.io server');
  });

	// Get access to the local camera and microphone
	navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
		// Create a local media track
		const localVideoTrack = new Twilio.Video.LocalVideoTrack(mediaStream.getVideoTracks()[0]);
		const localAudioTrack = new Twilio.Video.LocalAudioTrack(mediaStream.getAudioTracks()[0]);

		// Create a video room
		const videoRoom = new Twilio.Video.connect(meetingId, {
			name: meetingId,
			tracks: [localVideoTrack, localAudioTrack]
		});

		// When a remote participant joins, add their media to the page
		videoRoom.on('participantConnected', (participant) => {
			participant.tracks.forEach((publication) => {
				if (publication.isSubscribed) {
					const track = publication.track;
					document.getElementById('remote-media').appendChild(track.attach());
				}
			});

			participant.on('trackSubscribed', (track) => {
				document.getElementById('remote-media').appendChild(track.attach());
			});
		});

		// When a remote participant disconnects, remove their media from the page
		videoRoom.on('participantDisconnected', (participant) => {
			participant.tracks.forEach((publication) => {
				const attachedElements = publication.track.detach();
				attachedElements.forEach((element) => element.remove());
			});
		});
	});
</script>

<svelte:head>
	<!-- Twilio Video CDN -->
	<script src="https://sdk.twilio.com/js/video/releases/2.15.2/twilio-video.min.js"></script>
	<!-- Socket.io CDN -->
	<script src="https://cdn.socket.io/4.6.0/socket.io.min.js" integrity="sha384-c79GN5VsunZvi+Q/WObgk2in0CbZsHnjEqvFxC5DxHn9lTfNce2WW6h2pH6u/kF+" crossorigin="anonymous"></script>
</svelte:head>
	
<div id="local-media" />
<div id="remote-media" />
