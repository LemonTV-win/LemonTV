<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">Events</h1>
	<ul>
		{#each data.events as event}
			<li>
				<a
					href="/events/{event.id}"
					class="flex items-center gap-2 border-b-1 border-gray-500 bg-gray-800 shadow-2xl"
				>
					<img src={event.image} alt={event.name} class="w-full max-w-64" />
					<span class="p-4 text-2xl text-white">{event.name}</span>
				</a>
			</li>
		{/each}
	</ul>
	<!-- 
  <h2>Ongoing Events</h2>
  
  <h2>Upcoming Events</h2>
  
  <h2>Past Events</h2> -->
</main>

<style>
	:global(body) {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)),
			url(https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/430c6088-8945-4472-9f79-59a32875b96c.jpg);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		min-height: 100dvh;
	}
</style>
