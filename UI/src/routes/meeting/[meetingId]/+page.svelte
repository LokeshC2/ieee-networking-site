<!-- Use this as the page to render when joined in a meeting. The meeting ID variable will be set automatically from URL. -->

<script>

	let meetingId;
	let participantId;

	import Share from '$lib/Share.svelte';
	import Join from '$lib/Join.svelte';
	import Meeting from '$lib/Meeting.svelte';
	
	import { onMount } from 'svelte';
	onMount(() => {
		meetingId = window.location.pathname.split('/')[2];
		if (meetingId) {
			const meeting = localStorage.getItem(meetingId);
			if (meeting) {
				const { participant } = JSON.parse(meeting);
				if (participant) {
					participantId = participant.id;
				}
			}
		}
	});
</script>

<svelte:head>
	<meta charset="utf-8" />
	<title>Twilio Video Demo</title>
</svelte:head>

<div>
	{#if participantId}
		<Meeting {meetingId} {participantId} />
	{:else}
		<Share {meetingId} />
		<Join {meetingId} />
	{/if}
</div>
