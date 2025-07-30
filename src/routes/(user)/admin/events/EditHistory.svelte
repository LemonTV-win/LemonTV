<!-- src/routes/(user)/admin/events/EditHistory.svelte -->
<script lang="ts">
	import EditHistory from '../UnifiedEditHistory.svelte';

	let {
		recordId
	}: {
		recordId: string;
	} = $props();

	// For events, we need to create a minimal record object
	const eventRecord = {
		id: recordId,
		name: 'Event' // This will be replaced by actual event data when available
	};
</script>

<EditHistory recordType="event" record={eventRecord} />
