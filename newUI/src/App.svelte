<script>
  import Create from "./lib/Create.svelte";
  import Join from "./lib/Join.svelte";
  import Share from "./lib/Share.svelte";
  import Meeting from "./lib/Meeting.svelte";

  import { io } from "socket.io-client";
  import { onMount } from "svelte";

  let meetingId;
  let participantId;
  
  let closingTime;
  let remainingTime

  setInterval(() => {
    if (closingTime) {
      remainingTime = Math.max(0, Math.floor((closingTime - Date.now()) / 1000));
    }
  }, 1000);
  
  let joined = false;

  let socket;

  let message;

  onMount(async () => {
    meetingId = window.location.pathname.split("/")[2] || null;

    message = "Waiting for server";
    setTimeout(() => {
      socket = io("http://localhost:3000");

      socket.on("connected", () => {
        message = "Connected to server";
      });

      socket.on("error", (err) => {
        message = "Error: " + err;
      });

      socket.on("meeting-created", (mId) => {
        message = "Meeting created";
        meetingId = mId;
      });

      socket.on("meeting-joined", ({ status, participantId: pId }) => {
        participantId = pId;
        message = "Meeting joined with status: " + status;
        history.replaceState({}, "", `/meeting/${meetingId}`);
        joined = true;
        if (status === "started") {
          message += "\nMeeting already started, waiting for next shuffle";
        }
      });

      socket.on("meeting-started", () => {
        message = "Meeting started";
      });

      socket.on("assigned-room", (room) => {
        closingTime = room.closingTime;
        message += "\nAssigned room" + JSON.stringify(room);
      });

      socket.on("no-partner", (t) => {
        message = "No partner found";
        closingTime = t;
      });

      socket.on("meeting-ended", () => {
        message = "Meeting ended";
      });

      socket.on("disconnect", () => {
        message = "Disconnected from server";
      });
    }, 3000);
  });

  function createMeeting() {
    socket.emit("create-meeting", {
      host: {
        name: "dummy",
        email: "x@example.com",
      },
      startTime: Date.now() + 0.25 * 60 * 1000,
      shuffles: 2,
      duration: 60 * 1000,
    });
  }

  function joinMeeting() {
    socket.emit("join-meeting", {
      meetingId,
      participant: {
        name: "dummy",
        email: "y@example.com",
      },
    });
  }

  function shareMeeting() {
    window.navigator.clipboard.writeText(
      window.location.origin + "/meeting/" + meetingId
    );
    alert("Meeting Link copied to clipboard");
  }
</script>

<main>
  <div>
    {message}
    {#if meetingId}
      <p>Meeting ID: {meetingId}</p>
      {#if joined}
        <p>Joined</p>
      {/if}
    {/if}
    <hr />
    <h4>Create</h4>
    <button on:click={createMeeting}>Create Meeting</button>
    <hr />
    <h4>Join</h4>
    <button on:click={joinMeeting}>Join Meeting</button>
    {#if participantId}
      <p>Participant ID: {participantId}</p>
    {/if}
    <hr />
    <h4>Share</h4>
    <button on:click={shareMeeting}>Share Meeting</button>
    <hr />
    {#if closingTime}
    <h4>Room-time remaining</h4>
      <p>Remaining time: {remainingTime}</p>
    {/if}
  </div>

  <div id="video">
    <div id="local">
      
  </div>
</main>
