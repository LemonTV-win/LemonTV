<script lang="ts">
	import IconParkSolidLocal from '~icons/icon-park-solid/local';
	let { region, class: className }: { region: string; class?: string } = $props();

	const REGION_TAGS = {
		APAC: 'APAC',
		EU: 'Europe',
		NA: 'America',
		CN: 'China'
	};
</script>

<div class={['flex items-center gap-2 rounded-sm bg-gray-700/50 px-2 py-1', className]}>
	<IconParkSolidLocal class="h-4 w-4" />
	<span>{REGION_TAGS[region as keyof typeof REGION_TAGS] || region}</span>
</div>
