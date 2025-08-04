<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import IconSelect from '$lib/components/ui/IconSelect.svelte';
	import IconOption from '$lib/components/ui/IconOption.svelte';
	import { FATE_TRIGGER_URL } from '$lib/consts';
	let { class: className = '', iconOnly = true }: { class?: string; iconOnly?: boolean } = $props();
</script>

<IconSelect
	value="strinova"
	onselect={(value: string) => {
		if (value === 'fate_trigger') {
			window.location.href = FATE_TRIGGER_URL;
		}
	}}
	{iconOnly}
	class={className}
>
	<IconOption label={m.strinova()} value="strinova">
		<img
			src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAALVBMVEUAAAAAAABHcEwAAAAAAAAAAAAAAAD/bC9AGwsfDQX1Zy3mYCrPVyZ0MRWhQx1SlF6FAAAAB3RSTlP/8QCjCgUO0RqAqwAAAOpJREFUOI19k1EWhSAIRDErMLP9L/cpgqLlmy+PcxsBDbbTO1jI+X2Dc+VW7eDbGkNfkq489Hy8lLg6YI9HJS60gEkQIvurhKzA/jfwFCX2vwE9fwJab0/qfu84JwTeSZAS+3kzYhOVI6gC8j3AbfxaAwnA+aMvRRIDNTkOvnZBBcBJZNskegE0zuFRQDfiOIeIcQRuuTlJMJWpLzfnZh+bXwk3+9h9JpyZfwPMqEIBQlUrsvhBZW5Tgds2+35RMuo1QDQDw6Mt86V/CTx/WifIS6QBML9ee6nUAZ//zrYNH8sDtt27pfyx/QAKcQzHXgZZvQAAAABJRU5ErkJggg=="
			alt="Strinova Logo"
			class="h-5 w-5"
		/>
	</IconOption>
	<IconOption label={m.fate_trigger()} value="fate_trigger">
		<img
			src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAARVBMVEVHcEwAAAAAAAAAAAAAAAAAAAD09PQjIyMAAAB3d3fh4eGEhIQ5OTn///9KSkrFxcXU1NSkpKSUlJQRERFXV1e0tLRlZWWDCw7wAAAACXRSTlMAA3jX/P///0VVnOm0AAABLklEQVR4AWXTUY6EIBBFUVUvDsgTBHX/S53pRiMj589wU6nEVPenH8aJNzOPQ999/dDCOoCf+73lFq6ipwVeFH03AKy8hEgxdCNA3LglIEmWYuzK/iZw0UqWxGXqKJzjy8rthxS43QHOZNjk9HW2gZfZ4wJJH6kNZknnYgIqRRMQJBkPh6Q1yjcBUeYaZcgKbeC1X6MOCGqDzQA7rNpZrdYmcBEwQIB91fkKTiMHXql8fcbUwRwlCZayaD4XUQebvjaCZIFEdFVgJYXZLEnWSA6s9drvAO9kmVl1D1pCQgd3cFxr7TN+LsWcTfU3Nx7Z6SOYhSegJsk5bRRtsEo6szx1MPHYJAOJytSNPKJJmf/GbuAhy9tQH84pGn19ekek1h6nW2jfq/PPojaV8/8F6UwcC/f3iFoAAAAASUVORK5CYII="
			alt="Fate Trigger Logo"
			class="h-5 w-5"
		/>
	</IconOption>
</IconSelect>
