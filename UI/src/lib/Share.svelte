<script>
	export let meetingId;
	import Join from './Join.svelte';

	const meetingLink = new URL(window.location.href).host + '/' + meetingId;
</script>

<div>
	<div>
		<h1>
			Meeting ID: <span id="meetingId">{meetingId}</span>
			<!-- //copy to clipboard button -->
			<button onclick={() => window.navigator.clipboard.writeText(meetingId)}>
				Copy Meeting ID
			</button>
		</h1>

		<!-- URL: domain/meetingId -->
		<h2>
			Meeting Link: <span id="meetingLink">{meetingLink}</span>
			<button onclick={() => window.navigator.clipboard.writeText(meetingLink)}>
				Copy Meeting Link
			</button>
		</h2>
	</div>

	<Join {meetingId} />
</div>
