<script>
	let userLocale; 

	let meetingName;
	let meetingShuffles;
	let meetingInterval;
	let meetingStart = Date.now() + 2 * 60 * 1000; //10 minutes from now

	//log everytime Start Date or Start Time changes
	// $: console.log(meetingStartDate, meetingStartTime);
	
	async function createMeeting() {
		const meeting = {
			name: meetingName,
			startTime: meetingStart,
			shuffles: meetingShuffles,
			interval: meetingInterval * 60 * 1000,
		};
		const response = await fetch('/api/create-meeting', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ meeting, host: {name: "dummy", email: "dummy@example.com"}})
		});

		const { meetingId } = await response.json();

		localStorage.setItem(meetingId, {
			meeting
		});

		window.location.href = `/meeting/${meetingId}`;
	}
</script>

<form on:submit|preventDefault={createMeeting}>
	<label for="meetingName">Meeting Name</label>
	<input type="text" id="meetingName" bind:value={meetingName} required />
	<br>
	<!-- <label for="meetingStartDate">Meeting Start Date</label>
	<input type="date" id="meetingStartDate" bind:value={meetingStartDate} required />
	<br>
	<label for="meetingStartTime">Meeting Start Time</label>
	<input type="time" id="meetingStartTime" bind:value={meetingStartTime} required />
	<br> -->
	<label for="meetingShuffles">Meeting Shuffles</label>
	<input type="number" id="meetingShuffles" bind:value={meetingShuffles} required />
	<br>
	<label for="meetingInterval">Meeting Interval (minutes)</label>
	<input type="number" id="meetingInterval" bind:value={meetingInterval} required />
	<br>
	<button type="submit">Create Meeting</button>
</form>
