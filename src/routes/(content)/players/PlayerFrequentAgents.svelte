<script lang="ts">
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import type { Character } from '$lib/data/game';
	import PlayerAgents from './[id]/PlayerAgents.svelte';

	let {
		playerAgents,
		playerIndex
	}: {
		playerAgents: [Character, number][];
		playerIndex: number;
	} = $props();

	let button: HTMLButtonElement | null = $state(null);
	let popover: HTMLUListElement | null = $state(null);

	let insidePopover = $state(false);
	let popoverPosition = $state({ x: 0, y: 0 });

	function updatePopoverPosition() {
		if (!button || !popover) return;

		const buttonRect = button.getBoundingClientRect();
		const popoverRect = popover.getBoundingClientRect();

		// Position popover to the right of the button
		let x = buttonRect.right + 12;
		let y = buttonRect.top;

		// Check if popover would go off-screen to the right
		if (x + popoverRect.width > window.innerWidth) {
			// Position to the left of the button instead
			x = buttonRect.left - popoverRect.width - 12;
		}

		// Check if popover would go off-screen to the bottom
		if (y + popoverRect.height > window.innerHeight) {
			y = window.innerHeight - popoverRect.height - 12;
		}

		// Ensure popover doesn't go off-screen to the top
		if (y < 12) {
			y = 12;
		}

		// Ensure popover doesn't go off-screen to the left
		if (x < 12) {
			x = 12;
		}

		popoverPosition = { x, y };
	}

	function showPopover() {
		if (!popover) return;

		// Update position before showing
		updatePopoverPosition();
		popover.showPopover();

		// Update position again after showing to account for actual dimensions
		setTimeout(updatePopoverPosition, 0);
	}
</script>

<svelte:window
	onpointerdown={(e) => {
		// only close if the click is outside the popover and the button
		if (!popover || !button) return;
		const pointer = {
			x: e.clientX,
			y: e.clientY
		};
		const popoverRect = popover?.getBoundingClientRect();
		const buttonRect = button?.getBoundingClientRect();

		const outsidePopover =
			pointer.x < popoverRect?.left ||
			pointer.x > popoverRect?.right ||
			pointer.y < popoverRect?.top ||
			pointer.y > popoverRect?.bottom;

		const outsideButton =
			pointer.x < buttonRect?.left ||
			pointer.x > buttonRect?.right ||
			pointer.y < buttonRect?.top ||
			pointer.y > buttonRect?.bottom;

		if (outsidePopover && outsideButton) {
			popover?.hidePopover();
		}
	}}
	onpointermove={(e) => {
		if (!popover || !button) return;
		const pointer = {
			x: e.clientX,
			y: e.clientY
		};
		const popoverRect = popover?.getBoundingClientRect();
		const buttonRect = button?.getBoundingClientRect();
		const leniency = 10;

		const outsidePopover =
			pointer.x < popoverRect?.left - leniency ||
			pointer.x > popoverRect?.right + leniency ||
			pointer.y < popoverRect?.top - leniency ||
			pointer.y > popoverRect?.bottom + leniency;

		const outsideButton =
			pointer.x < buttonRect?.left - leniency ||
			pointer.x > buttonRect?.right + leniency ||
			pointer.y < buttonRect?.top - leniency ||
			pointer.y > buttonRect?.bottom + leniency;

		insidePopover = !outsidePopover;

		if (outsidePopover && outsideButton) {
			popover?.hidePopover();
		}
	}}
	onresize={updatePopoverPosition}
/>

<button
	bind:this={button}
	popovertarget={`player-agents-extended-${playerIndex}`}
	class={[
		'relative mx-auto flex items-center justify-center gap-1 py-2 hover:brightness-110 hover:drop-shadow-[0_0_10px_rgba(255,240,220,0.5)]',
		insidePopover ? 'brightness-110 drop-shadow-[0_0_10px_rgba(255,240,220,0.5)]' : ''
	]}
	title={playerAgents.map(([agent]) => agent || null).join(', ')}
	onpointerenter={showPopover}
>
	{#each [...playerAgents.map(([agent]) => agent), ...[null, null, null]].slice(0, 3) as superstring, i (i)}
		<CharacterIcon character={superstring} />
	{/each}
</button>

{#if playerAgents.length > 3}
	<ul
		bind:this={popover}
		class={[
			'fixed z-50',
			'flex-col gap-0',
			'max-h-64',
			'rounded-lg border border-slate-600 bg-slate-800/50 backdrop-blur-sm',
			'[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800',
			'whitespace-nowrap'
		]}
		popover="auto"
		id={`player-agents-extended-${playerIndex}`}
		style:left={`${popoverPosition.x}px`}
		style:top={`${popoverPosition.y}px`}
	>
		<PlayerAgents {playerAgents} />
	</ul>
{/if}

<style>
	ul:popover-open {
		display: flex;
	}

	:global(li) {
		border-radius: 0 !important;
	}
</style>
