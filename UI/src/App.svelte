<script>
  import Create from "./lib/Create.svelte";
  import Join from "./lib/Join.svelte";
  import Share from "./lib/Share.svelte";
  import Meeting from "./lib/Meeting.svelte";

  import { onMount } from "svelte";

  import { meetingId, participantId } from "./stores/meeting";

  onMount(() => {
    let mId = /meeting\/(\d{6})/.exec(location)?.[1];
    if (mId) meetingId.set(mId);
  });

</script>

<main>
  {#if !$meetingId}
    <Create /> <Join />
  {:else if !$participantId}
    <Share /> <Join />
  {:else}
    <Meeting />
  {/if}
</main>
