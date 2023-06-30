<script>
  import Create from "./lib/Create.svelte";
  import Join from "./lib/Join.svelte";
  import Share from "./lib/Share.svelte";
  import Meeting from "./lib/Meeting.svelte";

  import { onMount } from "svelte";

  let meetingId, participantId, status, closingTime;

  onMount(() => {
    meetingId = /meeting\/(\d{6})/.exec(location)?.[1];
    if (meetingId) fetch(`/api/meeting?meetingId=${meetingId}`).then(res=>{if (!res.ok) {alert("Invalid meetingId"); location.href=location.origin}})
  });
</script>

<main>
  {#if meetingId && !participantId}
    <Share bind:meetingId />
    <Join bind:meetingId bind:participantId bind:status bind:closingTime />
  {:else}
    <Create bind:meetingId />
  {/if}

  {#if meetingId && participantId}
    <Meeting bind:meetingId bind:participantId bind:status bind:closingTime />
  {/if}
</main>
