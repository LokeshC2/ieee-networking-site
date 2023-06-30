<script>
  export let meetingId;
  $: url = location.origin + "/meeting/" + meetingId
</script>

<div>
  <h1>Share</h1>
  <p>Share this meeting ID with your participants:</p>
  <strong>{meetingId}</strong>
  <button onclick={() => navigator.clipboard.writeText(url)}>Copy</button>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 10vh;
  }
</style>
