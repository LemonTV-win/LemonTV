<script lang="ts">
	import { getContext, type Snippet, onMount } from 'svelte';
	import type { Option } from './IconSelect.svelte';
	let {
		children,
		label,
		value
	}: {
		children: Snippet<[]>;
		label: string;
		value: string;
	} = $props();

	const options = getContext<Option[]>('options');

	onMount(() => {
		console.log('options', options);
		options.push({
			value,
			label,
			icon: children
		});
	});
</script>
