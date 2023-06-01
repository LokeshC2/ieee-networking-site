export function load({ params }) {
  console.log('load', params)
  let meetingId = params.meetingId
  let meeting = JSON.parse(localStorage.getItem(meetingId) || '{}')
  let partcipantId = meeting.participant.id

  return {
    meetingId: params.meetingId,
    partcipantId: partcipantId,
  }
}
