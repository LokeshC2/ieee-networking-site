<!-- Use this as the page to render when joined in a meeting. The meeting ID variable will be set automatically from URL. -->

<script>
    export let meetingId;

    import { onMount } from 'svelte';

</script>

<!DOCTYPE html>
<html lang='en-US'>
  <head>
    <meta charset="utf-8" />
    <title>Twilio Video Demo</title>
    <!-- Twilio Video CDN -->
    <script src="https://sdk.twilio.com/js/video/releases/2.15.2/twilio-video.min.js"></script>
  </head>
  <body>
    <div id="video-container"></div>
  </body>
</html>