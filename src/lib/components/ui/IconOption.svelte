<script lang="ts">
	import { getContext, type Snippet, onMount } from 'svelte';
	import type { Option } from './IconSelect.svelte';
	let {
		children,
		label,
		value
	}: {
		children?: Snippet<[]>;
		label: string;
		value: string;
	} = $props();

	const options = getContext<Option[]>('options');

	onMount(() => {
		const option: Option = {
			value,
			label,
			icon: children
		};

		options.push(option);

		return () => {
			const index = options.findIndex((candidate) => candidate === option);

			if (index !== -1) {
				options.splice(index, 1);
			}
		};
	});
</script>
