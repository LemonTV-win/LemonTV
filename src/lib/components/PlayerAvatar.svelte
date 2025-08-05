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
	class={[
		'rounded-full object-cover',
		className,
		!className.includes('h-') && 'h-10 min-h-10',
		!className.includes('w-') && 'w-10 min-w-10'
	]}
/>
