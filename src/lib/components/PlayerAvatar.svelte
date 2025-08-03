<script lang="ts">
	import type { Player } from '$lib/data/players';
	import PlaceholderAvatar from '$assets/placeholder_avatar.png';

	let {
		player,
		class: className = ''
	}: { player: Player & { avatarURL?: string | null }; class: string } = $props();
</script>

<img
	src={player.avatarURL || player.avatar || PlaceholderAvatar}
	alt={player.name}
	class={['h-10 w-10 rounded-full object-cover', className]}
/>
