<script>
	export let meetingId;
	async function joinMeeting() {
		const participant = {
			name: participantName.value,
			email: participantEmail.value
		};
		const { meeting, participantId } = fetch('/api/join', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				meetingId: document.getElementById('meetingId').value,  // use this to get the meeting id from the form instead of the URL to allow for joining a meeting from the home page
				participant: {
					name: participantName
				}
			})
		}).then((res) => res.json());

		console.log(meeting);
		console.log(participantId);

		localStorage.setItem(meetingId, {
			meeting,
			participant: {
				id: participantId,
				name: participantName
			}
		});

    window.location.href = `/${meetingId}`;
	}
</script>

<form on:submit|preventDefault={joinMeeting}>
	<label for="meetingId">Meeting ID</label>
	<input type="text" id="meetingId" name="meetingId" value={meetingId || ""} required />

	<label for="participantName">Participant Name</label>
	<input type="text" id="participantName" name="participantName" required />
	<!-- <label for="participantEmail">Participant Email</label>
  <input type="text" id="participantEmail" name="participantEmail" /> -->

	<button type="submit">Join Meeting</button>
</form>
