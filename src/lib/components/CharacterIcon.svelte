<script lang="ts">
	import type { Character } from '$lib/data/game';
	import { m } from '$lib/paraglide/messages.js';
	const CHARACTER_2_IMAGE: Record<Character, string> = {
		Michele:
			'https://static.wikitide.net/strinovawiki/thumb/f/f9/Michele_Profile.png/150px-Michele_Profile.png',
		Nobunaga:
			'https://static.wikitide.net/strinovawiki/thumb/2/20/Nobunaga_Profile.png/150px-Nobunaga_Profile.png',
		Kokona: 'https://static.wikitide.net/strinovawiki/1/16/Kokona_Profile.png',
		Yvette:
			'https://static.wikitide.net/strinovawiki/thumb/3/37/Yvette_Profile.png/150px-Yvette_Profile.png',
		Flavia:
			'https://static.wikitide.net/strinovawiki/thumb/f/f2/Flavia_Profile.png/150px-Flavia_Profile.png',
		Yugiri: 'https://static.wikitide.net/strinovawiki/d/d5/Yugiri_Profile.png',
		Leona:
			'https://static.wikitide.net/strinovawiki/thumb/b/b4/Leona_Profile.png/150px-Leona_Profile.png',
		Reiichi: 'https://static.wikitide.net/strinovawiki/1/14/Reiichi_Profile.png',
		Lawine:
			'https://static.wikitide.net/strinovawiki/thumb/a/aa/Lawine_Profile.png/150px-Lawine_Profile.png',
		Ming: 'https://static.wikitide.net/strinovawiki/7/78/Ming_Profile.png',
		Meredith: 'https://static.wikitide.net/strinovawiki/5/56/Meredith_Profile.png',
		Eika: 'https://static.wikitide.net/strinovawiki/a/a8/Eika_Profile.png',
		Kanami:
			'https://static.wikitide.net/strinovawiki/thumb/c/c4/Kanami_Profile.png/150px-Kanami_Profile.png',
		Fragrans:
			'https://static.wikitide.net/strinovawiki/thumb/a/a8/Fragrans_Profile.png/150px-Fragrans_Profile.png',
		Mara: 'https://static.wikitide.net/strinovawiki/thumb/5/51/Mara_Profile.png/150px-Mara_Profile.png',
		Audrey:
			'https://static.wikitide.net/strinovawiki/thumb/1/16/Audrey_Profile.png/150px-Audrey_Profile.png',
		Celestia:
			'https://static.wikitide.net/strinovawiki/thumb/b/bf/Celestia_Profile.png/150px-Celestia_Profile.png',
		Maddelena:
			'https://static.wikitide.net/strinovawiki/thumb/0/03/Maddelena_Profile.png/150px-Maddelena_Profile.png',
		'Bai Mo': 'https://static.wikitide.net/strinovawiki/b/ba/Bai_Mo_Profile.png',
		Fuchsia: 'https://static.wikitide.net/strinovawiki/a/ad/Fuchsia_Profile.png',
		Galatea: 'https://static.wikitide.net/strinovawiki/f/ff/Galatea_Profile.png',
		Chiyo: 'https://static.wikitide.net/strinovawiki/9/93/Chiyo_Profile.png'
	};
	let { character, class: className = '' }: { character: Character | null; class?: string } =
		$props();
</script>

{#if character}
	<img
		class={['h-9 min-h-9 w-9 min-w-9 flex-shrink-0 rounded-full object-contain', className]}
		src={CHARACTER_2_IMAGE[character]}
		alt={m[character]()}
		title={m[character]()}
	/>
{:else}
	<div
		class={[
			'flex h-9 min-h-9 w-9 min-w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-600 text-gray-400',
			className
		]}
	>
		?
	</div>
{/if}
