<script lang="ts">
	import type { Player } from '$lib/data/players';
	import PlaceholderAvatar from '$assets/placeholder_avatar.png';

	let { player, class: className = '' }: { player: Player; class: string } = $props();
</script>

<img src={PlaceholderAvatar} alt={player.name} class={['h-10 w-10 rounded-full', className]} />
