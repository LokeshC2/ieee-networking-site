<script>
  import {
    meetingId,
    participantId,
    status,
    closingTime,
    roomId,
    token,
    partnerId,
  } from "../stores/meeting";

  let participantName = "test";
  let participantEmail = "test@test.co";

  function joinMeeting() {
    const joinData = {
      meetingId: $meetingId,
      participant: { name: participantName, email: participantEmail },
    };

    fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(joinData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        participantId.set(data.participantId);
        status.set(data.status);
        closingTime.set(data.closingTime);
        if (status == "started") {
          roomId.set(data.roomId);
          token.set(data.token);
          partnerId.set(data.partnerId);
        }
      })
      .catch((err) => console.log(err));
  }
</script>

<div>
  <h1>Join</h1>
  <form on:submit|preventDefault={joinMeeting}>
    <input
      type="text"
      placeholder="MeetingId"
      name="meetingId"
      bind:value={$meetingId}
      readonly />

    <input
      type="text"
      placeholder="Participant Name"
      name="participantName"
      bind:value={participantName}
      required />
    <br />
    <input
      type="email"
      placeholder="Participant Email"
      name="participantEmail"
      bind:value={participantEmail}
      required />
    <br />
    <button type="submit">Join</button>
  </form>
</div>
