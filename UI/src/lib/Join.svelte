<script>

  export let meetingId;
  export let participantId;
  export let status;
  export let closingTime;

  let participantName = "";
  let participantEmail = "";

  function joinMeeting() {
    const joinData = {
      meetingId,
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
        participantId = data.participantId;
        status = data.status;
        closingTime = data.closingTime;
      })
      .catch((err) => console.log(err));
  }
</script>

<div>
  <form on:submit|preventDefault={joinMeeting}>
    <input
      type="text"
      placeholder="MeetingId"
      name="meetingId"
      bind:value={meetingId}
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
