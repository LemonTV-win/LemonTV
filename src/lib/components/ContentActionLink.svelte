<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidView from '~icons/icon-park-solid/eyes';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';

	let {
		href,
		type,
		target = '_blank',
		title
	}: {
		href: string;
		type?: 'view' | 'edit';
		target?: '_blank' | '_self';
		title?: string;
	} = $props();

	let text = $derived(type === 'view' ? m.view_all() : m.edit());
</script>

<a
	{href}
	class="flex items-center gap-1.5 rounded-md border border-gray-500 bg-white/10 px-2 py-1 text-sm font-semibold text-gray-400 backdrop-blur-lg transition-all duration-200 hover:bg-gray-700"
	{target}
	rel={target === '_blank' ? 'noopener noreferrer' : undefined}
	{title}
>
	{#if type === 'view'}
		<IconParkSolidView class="h-4 w-4" />
	{:else}
		<IconParkSolidEdit class="h-4 w-4" />
	{/if}
	{text}&nbsp;{title}
</a>
