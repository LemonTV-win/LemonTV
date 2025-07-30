<script lang="ts">
	interface Props {
		currentPage: number;
		totalPages: number;
		maxVisiblePages?: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage, totalPages, maxVisiblePages = 7, onPageChange }: Props = $props();

	function generatePageNumbers(): (number | string)[] {
		// 1) if we can show them all, do so
		if (totalPages <= maxVisiblePages) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: (number | string)[] = [];
		const startPage = Math.max(1, currentPage - 2);
		const endPage = Math.min(totalPages, currentPage + 2);

		// 2) first three pages
		for (let i = 1; i <= 3; i++) {
			pages.push(i);
		}

		// 3) left ellipsis if gap
		if (startPage > 4) {
			pages.push('…');
		}

		// 4) pages around current (but skip the first/last three)
		for (let i = startPage; i <= endPage; i++) {
			if (i > 3 && i <= totalPages - 3) {
				pages.push(i);
			}
		}

		// 5) right ellipsis if gap
		if (endPage < totalPages - 3) {
			pages.push('…');
		}

		// 6) last three pages
		for (let i = totalPages - 2; i <= totalPages; i++) {
			pages.push(i);
		}

		return pages;
	}

	function handlePageClick(page: number) {
		if (page !== currentPage) {
			onPageChange(page);
		}
	}
</script>

<div class="flex justify-center gap-2">
	{#each generatePageNumbers() as pageNum (pageNum)}
		{#if typeof pageNum === 'string'}
			<span class="px-3 py-1 text-sm text-gray-400">{pageNum}</span>
		{:else}
			<button
				class="rounded-md px-3 py-1 text-sm {pageNum === currentPage
					? 'bg-yellow-500 text-black'
					: 'bg-slate-700 text-white hover:bg-slate-600'}"
				onclick={() => handlePageClick(pageNum)}
			>
				{pageNum}
			</button>
		{/if}
	{/each}
</div>
