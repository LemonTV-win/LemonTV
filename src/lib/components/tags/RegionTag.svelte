<script lang="ts">
	import IconParkSolidLocal from '~icons/icon-park-solid/local';
	let { region, class: className }: { region: string; class: string } = $props();
</script>

<div class={['flex items-center gap-2 rounded-sm bg-gray-700/50 px-2 py-1', className]}>
	<IconParkSolidLocal class="h-4 w-4" />
	<span>{region}</span>
</div>
