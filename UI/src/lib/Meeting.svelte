<script>
  import * as Video from "twilio-video";

  export let meetingId;
  export let participantId;
  export let status;
  export let closingTime;

  export let roomId;
  export let token;
  export let partnerId;

  
  console.info(meetingId, participantId, status, closingTime, roomId, token, partnerId);
  connectToMeeting(meetingId, participantId);

  function connectToMeeting(meetingId, participantId) {
    const eventSource = new EventSource(
      `/api/match?meetingId=${meetingId}&participantId=${participantId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { meetingId, participantId, partnerId, roomId, token } = data;

      if (partnerId) {
        console.log("Matched with", partnerId);
        startRoom(roomId, token);
      } else {
        console.log("Waiting for match");
      }
    };

    eventSource.addEventListener("end", (event) => {
      console.log("Connection closed");
      endMeeting();
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.log(error);
      eventSource.close();
    };

    eventSource.onopen = () => {
      console.log("Connection opened");
    };
  }

  const container = document.getElementById("video-container");

  async function startRoom (event) {
    // join the video room with the token
    const room = await Video.connect(token, {room: roomId})

    // render the local and remote participants' video and audio tracks
    handleConnectedParticipant(room.localParticipant);
    room.participants.forEach(handleConnectedParticipant);
    room.on("participantConnected", handleConnectedParticipant);

    // handle cleanup when a participant disconnects
    room.on("participantDisconnected", handleDisconnectedParticipant);
    window.addEventListener("pagehide", () => room.disconnect());
    window.addEventListener("beforeunload", () => room.disconnect());
  };

  const handleConnectedParticipant = (participant) => {
    // create a div for this participant's tracks
    const participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);
    container.appendChild(participantDiv);

    // iterate through the participant's published tracks and
    // call `handleTrackPublication` on them
    participant.tracks.forEach((trackPublication) => {
      handleTrackPublication(trackPublication, participant);
    });

    // listen for any new track publications
    participant.on("trackPublished", handleTrackPublication);
  };

  const handleTrackPublication = (trackPublication, participant) => {
    function displayTrack(track) {
      // append this track to the participant's div and render it on the page
      const participantDiv = document.getElementById(participant.identity);
      // track.attach creates an HTMLVideoElement or HTMLAudioElement
      // (depending on the type of track) and adds the video or audio stream
      participantDiv.append(track.attach());
    }

    // check if the trackPublication contains a `track` attribute. If it does,
    // we are subscribed to this track. If not, we are not subscribed.
    if (trackPublication.track) {
      displayTrack(trackPublication.track);
    }

    // listen for any new subscriptions to this track publication
    trackPublication.on("subscribed", displayTrack);
  };

  const handleDisconnectedParticipant = (participant) => {
    // stop listening for this participant
    participant.removeAllListeners();
    // remove this participant's div from the page
    const participantDiv = document.getElementById(participant.identity);
    participantDiv.remove();
  };

  const joinVideoRoom = async (roomName, token) => {
    // join the video room with the Access Token and the given room name
    const room = await Video.connect(token, {
      room: roomName,
    });
    return room;
  };
</script>

<div id = "video-container">
</div>
