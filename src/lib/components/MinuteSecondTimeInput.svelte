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

	function decomposeTime(totalSeconds: number) {
		const minutes = Math.max(0, Math.floor(totalSeconds / 60));
		const seconds = Math.max(0, totalSeconds % 60);
		return { minutes, seconds };
	}

	const decomposedTime = decomposeTime(typeof value === 'number' ? value : Number(value) || 0);

	let minutesInput = $state(decomposedTime.minutes.toString());
	let secondsInput = $state(decomposedTime.seconds.toString());

	function setInputsFromValue(total: number | string) {
		const totalSeconds = typeof total === 'number' ? total : Number(total) || 0;
		const { minutes, seconds } = decomposeTime(totalSeconds);
		minutesInput = String(minutes);
		secondsInput = String(seconds);
	}

	$effect(() => {
		setInputsFromValue(value);
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

	function notifyValueNoCarry() {
		let minutes = parseInt(minutesInput);
		let seconds = parseInt(secondsInput);
		if (!Number.isFinite(minutes) || minutes < 0) minutes = 0;
		if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
		value = minutes * 60 + seconds;
	}
</script>

<div class={className}>
	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
	<div class="grid grid-cols-[1fr_auto_1fr] items-center justify-items-end gap-2">
		<input
			type="number"
			id={id ? `${id}-min` : undefined}
			min="0"
			placeholder={minutesPlaceholder}
			bind:value={minutesInput}
			oninput={notifyValueNoCarry}
			onblur={normalizeAndNotify}
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-center text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			required
		/>
		<span class="text-slate-400">:</span>
		<input
			type="number"
			id={id ? `${id}-sec` : undefined}
			min="0"
			placeholder={secondsPlaceholder}
			bind:value={secondsInput}
			oninput={notifyValueNoCarry}
			onblur={normalizeAndNotify}
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-center text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			required
		/>
		<span class="col-span-full mx-1 text-sm text-slate-400">({value}s)</span>
	</div>
</div>
