<script>
	async function createMeeting() {
		const meeting = {
			meetingName: meetingName.value,
			meetingPassword: meetingPassword.value,
			startTime: meetingStartTime.value || Date.now(),
			shuffleDuration: ShuffleDuration.value,
			description: meetingDescription.value
		};
		const response = await fetch('/api/create-meeting', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ meeting, host: {name: "dummy", email: "dummy"} })
		});

		const { meetingId } = await response.json();

		localStorage.setItem(meetingId, {
			meeting
		});

		window.location.href = `/${meetingId}`;
	}
</script>

<form on:submit|preventDefault={createMeeting}>
	<label for="meetingName">Meeting Name</label>
	<input type="text" id="meetingName" name="meetingName" required />
	<br />
	<label for="meetingPassword">Meeting Password</label>
	<input type="text" id="meetingPassword" name="meetingPassword" />
	<br />
	<label for="meetingStartTime">Meeting Start Time</label>
	<input type="time" id="meetingStartTime" name="meetingStartTime" />
	<br />
	<label for="ShuffleDuration">Shuffle Duration</label>
	<select id="ShuffleDuration" name="ShuffleDuration" required>
		<option value={1}>1 Minute</option>
		<option value={5}>5 Minutes</option>
	</select>
	<br />
	<label for="meetingDescription">Meeting Description</label>
	<input type="text" id="meetingDescription" name="meetingDescription" />

	<button type="submit">Create Meeting</button>
</form>
