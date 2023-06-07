<script>
  import Create from "./lib/Create.svelte";
  import Join from "./lib/Join.svelte";
  import Share from "./lib/Share.svelte";
  import Meeting from "./lib/Meeting.svelte";
  
  import { io } from "socket.io-client";
  import { onMount } from "svelte";

  let meetingId;
  let joined = false;

  let socket;

  onMount(()=>{
    socket = io();
  })

</script>

<main>
  <div>
    <h1>Networking Site</h1>

    {#if !meetingId}
      <div class="card">
        <Create />
      </div>
    {/if}

    <div class="card">
      <Join meetingId />
    </div>

    {#if meetingId && !joined}
      <div class="card">
        <Share meetingId />
      </div>
    {/if}

    {#if meetingId && joined}
      <div class="card">
        <Meeting meetingId />
      </div>
    {/if}

  </div>
</main>

<style>
  /* .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  } */
</style>
