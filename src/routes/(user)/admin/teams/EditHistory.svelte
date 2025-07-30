<script lang="ts">
	import EditHistory from '../UnifiedEditHistory.svelte';
	import type { Team } from '$lib/server/db/schemas/game/team';

	let {
		team,
		aliases
	}: {
		team: Team;
		aliases: {
			alias: string;
		}[];
	} = $props();
</script>

<EditHistory recordType="team" record={team} {aliases} />
