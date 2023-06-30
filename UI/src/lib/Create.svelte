<script>
  export let meetingId;

  let meetingName = "";
  let startTime = "";
  let numShuffles = "";
  let shuffleDuration = "";
  let host = "";
  let hostName = "";
  let hostEmail = "";

  function createMeeting() {
    const createData = {
      meetingName,
      startTime,
      numShuffles,
      shuffleDuration: shuffleDuration * 1000 * 60,
      host: { name: hostName, email: hostEmail },
    };

    fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        meetingId = data.meetingId;
      })
      .catch((err) => console.log(err));
  }
</script>

<div class="create">
  <h1>Create</h1>
  <br />
  <form on:submit|preventDefault={createMeeting}>
    <input
      type="text"
      placeholder="Meeting Name"
      name="meetingName"
      bind:value={meetingName} />
    <br />
    <input
      type="datetime-local"
      placeholder="Start Time"
      name="startTime"
      bind:value={startTime} />
    <br />
    <input
      type="number"
      placeholder="Number of Shuffles"
      name="numShuffles"
      bind:value={numShuffles} />
    <br />
    <input
      type="number"
      placeholder="Shuffle Duration"
      name="shuffleDuration"
      bind:value={shuffleDuration} />
    <br />
    <input
      type="text"
      placeholder="Host Name"
      name="hostName"
      bind:value={hostName} />
    <br />
    <input
      type="text"
      placeholder="Host Email"
      name="hostEmail"
      bind:value={hostEmail} />
    <br />
    <button type="submit">Create</button>
  </form>
</div>