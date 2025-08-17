<script lang="ts">
	let {
		value = $bindable(0),
		class: className = '',
		name = '',
		id = '',
		minutesPlaceholder = 'MM',
		secondsPlaceholder = 'SS'
	}: {
		value?: number | string;
		class?: string;
		name?: string;
		id?: string;
		minutesPlaceholder?: string;
		secondsPlaceholder?: string;
	} = $props();

	let minutesInput = $state('');
	let secondsInput = $state('');

	function setInputsFromValue(total: number | string) {
		const totalSeconds = typeof total === 'number' ? total : Number(total) || 0;
		const minutes = Math.max(0, Math.floor(totalSeconds / 60));
		const seconds = Math.max(0, totalSeconds % 60);
		minutesInput = String(minutes);
		secondsInput = String(seconds);
	}

	$effect(() => {
		const incoming = typeof value === 'number' ? value : Number(value) || 0;
		const current = (parseInt(minutesInput) || 0) * 60 + (parseInt(secondsInput) || 0);
		if (incoming !== current) {
			setInputsFromValue(incoming);
		}
	});

	function normalizeAndNotify() {
		let minutes = parseInt(minutesInput);
		let seconds = parseInt(secondsInput);
		if (!Number.isFinite(minutes) || minutes < 0) minutes = 0;
		if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
		if (seconds >= 60) {
			const extraMinutes = Math.floor(seconds / 60);
			minutes += extraMinutes;
			seconds = seconds % 60;
			minutesInput = String(minutes);
			secondsInput = String(seconds);
		}
		value = minutes * 60 + seconds;
	}
</script>

<div class={className}>
	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
	<div class="flex items-center gap-2">
		<input
			type="number"
			id={id ? `${id}-min` : undefined}
			min="0"
			placeholder={minutesPlaceholder}
			bind:value={minutesInput}
			oninput={normalizeAndNotify}
			class="w-24 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			required
		/>
		<span class="text-slate-400">:</span>
		<input
			type="number"
			id={id ? `${id}-sec` : undefined}
			min="0"
			placeholder={secondsPlaceholder}
			bind:value={secondsInput}
			oninput={normalizeAndNotify}
			class="w-24 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			required
		/>
	</div>
</div>
