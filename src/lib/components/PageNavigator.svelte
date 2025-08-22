<script lang="ts">
	interface Props {
		currentPage: number;
		totalPages: number;
		maxVisiblePages?: number;
		pageSize?: number;
		onPageChange: (page: number) => void;
	}

	let {
		currentPage,
		totalPages,
		maxVisiblePages = 7,
		pageSize = $bindable(100),
		onPageChange
	}: Props = $props();

	function generatePageNumbers(): (number | string)[] {
		if (totalPages <= maxVisiblePages) {
			// If we can show all pages, just return them
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pageNumbers: (number | string)[] = [];
		const sideWidth = Math.floor((maxVisiblePages - 2) / 2); // How many pages to show on each side of the current page

		// Determine the start and end of the main page number block
		let start = currentPage - sideWidth;
		let end = currentPage + sideWidth;

		// Adjust if the window is too close to the start
		if (start < 2) {
			end += 2 - start;
			start = 2;
		}

		// Adjust if the window is too close to the end
		if (end >= totalPages) {
			start -= end - (totalPages - 1);
			end = totalPages - 1;
		}

		// Ensure start is not less than 2
		if (start < 2) start = 2;

		// Always show the first page
		pageNumbers.push(1);

		// Add left ellipsis if there's a gap
		if (start > 2) {
			pageNumbers.push('…');
		}

		// Add the main window of pages
		for (let i = start; i <= end; i++) {
			pageNumbers.push(i);
		}

		// Add right ellipsis if there's a gap
		if (end < totalPages - 1) {
			pageNumbers.push('…');
		}

		// Always show the last page
		pageNumbers.push(totalPages);

		return pageNumbers;
	}

	function handlePageClick(page: number) {
		if (page !== currentPage) {
			onPageChange(page);
		}
	}
</script>

<div class="grid grid-cols-[1fr_auto]">
	<div class="flex justify-center gap-2">
		{#if totalPages > 1}
			{#each generatePageNumbers() as pageNum (pageNum)}
				{#if typeof pageNum === 'string'}
					<span class="px-3 py-1 text-sm text-gray-400">{pageNum}</span>
				{:else}
					<button
						class="cursor-pointer rounded-md px-3 py-1 text-sm {pageNum === currentPage
							? 'bg-yellow-500 text-black'
							: 'bg-slate-700 text-white hover:bg-slate-600'}"
						onclick={() => handlePageClick(pageNum)}
					>
						{pageNum}
					</button>
				{/if}
			{/each}
		{/if}
	</div>

	<select
		class="rounded-md bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600"
		bind:value={pageSize}
	>
		<option value={10}>10</option>
		<option value={50}>50</option>
		<option value={100}>100</option>
		<option value={200}>200</option>
		<option value={500}>500</option>
		<option value={1000}>1000</option>
	</select>
</div>
