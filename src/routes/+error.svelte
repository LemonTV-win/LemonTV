<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import MaterialSymbolsErrorRounded from '~icons/material-symbols/error-rounded';
	import MaterialSymbolsHomeRounded from '~icons/material-symbols/home-rounded';
</script>

<div
	class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center"
>
	<div class="max-w-md">
		<div class="mb-8 flex justify-center">
			<MaterialSymbolsErrorRounded class="h-24 w-24 text-yellow-300" />
		</div>

		<h1 class="mb-4 text-4xl font-bold text-white">
			{#if page.status === 404}
				{m.error_404_title()}
			{:else if page.status === 500}
				{m.error_500_title()}
			{:else}
				{m.error_generic_title()}
			{/if}
		</h1>

		<p class="mb-8 text-lg text-gray-300">
			{#if page.status === 404}
				{m.error_404_message()}
			{:else if page.status === 500}
				{m.error_500_message()}
			{:else}
				{m.error_generic_message()}
			{/if}
		</p>

		<div class="flex justify-center gap-4">
			<a
				href="/"
				class="flex items-center gap-2 rounded-md bg-yellow-300 px-6 py-3 text-gray-900 transition-colors duration-200 hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
			>
				<MaterialSymbolsHomeRounded class="h-5 w-5" />
				{m.error_return_home()}
			</a>

			<button
				onclick={() => window.history.back()}
				class="rounded-md border border-gray-500 px-6 py-3 text-white transition-colors duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
			>
				{m.error_go_back()}
			</button>
		</div>
	</div>
</div>
