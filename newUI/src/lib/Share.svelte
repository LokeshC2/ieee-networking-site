<script>
	export let meetingId;
	import Join from './Join.svelte';
	import { onMount } from 'svelte';

	let meetingLink = "<unavailable>";

	onMount(() => {
		meetingId = window.location.pathname.split('/')[2];
		meetingLink = new URL(window.location.href).host + '/' + meetingId;

		document.getElementById('meetingId').innerText = meetingId;
		document.getElementById('meetingLink').innerText = meetingLink;

		document.getElementById('copy-meeting-id').addEventListener('click', () => {
			navigator.clipboard.writeText(meetingId);
		});
		document.getElementById('copy-meeting-link').addEventListener('click', () => {
			navigator.clipboard.writeText(meetingLink);
		});
	});
</script>

<div>
	<div>
		<h1>
			Meeting ID: <span id="meetingId">{meetingId}</span>
			<!-- //copy to clipboard button -->
			<button id="copy-meeting-id">
				Copy Meeting ID
			</button>
		</h1>

		<!-- URL: domain/meetingId -->
		<h2>
			Meeting Link: <span id="meetingLink">{meetingLink}</span>
			<button id="copy-meeting-link">
				Copy Meeting Link
			</button>
		</h2>
	</div>
</div>
