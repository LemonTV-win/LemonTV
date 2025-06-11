<script lang="ts">
	import type { CommunityTag as Tag } from '$lib/server/db/schemas/about/community';

	let { tag, class: className }: { tag: Tag; class?: string } = $props();

	const getTagStyles = (category: string) => {
		switch (category) {
			case 'language':
				return 'border-blue-500/50 bg-blue-500/10 text-blue-300';
			case 'type':
				return 'border-purple-500/50 bg-purple-500/10 text-purple-300';
			case 'status':
				return 'border-green-500/50 bg-green-500/10 text-green-300';
			default:
				return 'border-gray-500/50 bg-gray-500/10 text-gray-300';
		}
	};
</script>

<span
	class={['rounded-full border px-2 py-0.5 text-xs', getTagStyles(tag.category), className]}
	title={`${tag.category}:${tag.value}`}
>
	{tag.name}
</span>
