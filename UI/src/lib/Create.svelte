<script>
  import { meetingId } from "../stores/meeting";

  let meetingName = "wer";
  let startTime = new Date(Date.now() + 1000 * 60 * 5)
  let startDate = startTime.getDate() + "/" + startTime.getMonth() + "/" + startTime.getFullYear();
  let startHour = startTime.getHours();
  let startMinute = startTime.getMinutes();
  let numShuffles = "5";
  let shuffleDurationSec = "60";
  let hostName = "loks";
  let hostEmail = "lok@mail.com";

  $: startTime = new Date(startDate + "T" + startHour + ":" + startMinute);


  function createMeeting() {
    const createData = {
      meetingName,
      startTime,
      numShuffles,
      shuffleDurationSec,
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
        meetingId.set(data.meetingId);
        history.pushState(null, null, "/meeting/" + data.meetingId);
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
    <div class="date">
    <input
      type="date-local"
      placeholder="Start Date"
      name="startDate"
      bind:value={startDate} />
    <input
      type="number"
      placeholder="Start Hour"
      name="startHour"
      min="0"
      max="23"
      bind:value={startHour} />
    <input
      type="number"
      placeholder="Start Minute"
      name="startMinute"
      min="0"
      max="59"
      bind:value={startMinute} />
    </div>
    <br />
    <div class="interval">
      <input
        type="number"
        placeholder="Number of Shuffles"
        name="numShuffles"
        bind:value={numShuffles} />
      <input
        type="number"
        placeholder="Shuffle Duration (in seconds)"
        name="shuffleDuration"
        bind:value={shuffleDurationSec} />
    </div>
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

<style>
  div.date,
  div.interval {
    flex-direction: row;
  }
  input {
    margin: 5px;
    width: 10rem;
    display: inline;
  }
  input[name="startHour"],
  input[name="startMinute"] {
    width: 2.5rem;
  }
  input[name="numShuffles"],
  input[name="shuffleDuration"] {
    width: 5rem;
  }
</style>