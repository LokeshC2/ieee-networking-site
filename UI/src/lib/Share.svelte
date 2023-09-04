<script>
  import { meetingId } from "../stores/meeting.js";
  fetch("/api/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meetingId: $meetingId }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      meetingId.set(data.meetingId);
    })
    .catch((err) => console.log(err));
  $: url = location.origin + "/meeting/" + $meetingId
</script>

<div>
  <h1>Share</h1>
  <p>Share this meeting ID with your participants:</p>
  <strong>{$meetingId}</strong>
  <button on:click={() => navigator.clipboard.writeText(url)}>Copy</button>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
