<script>
	import IconDiscord from '~icons/simple-icons/discord';
	import IconGithub from '~icons/simple-icons/github';
	import IconTwitch from '~icons/simple-icons/twitch';
	import IconX from '~icons/simple-icons/x';
	import IconYoutube from '~icons/simple-icons/youtube';
	import * as m from '$lib/paraglide/messages';
</script>

<main class="glass-container mx-auto max-w-screen-lg p-12">
	<div class="glass rounded-lg p-8 hover:scale-100">
		<div class="mx-auto max-w-4xl">
			<section class="mb-16 text-center">
				<img src="/favicon.svg" alt="LemonTV Logo" class="mx-auto mb-6 h-24 w-24" />
				<h1 class="mb-4 text-4xl font-bold">{m.about_title()}</h1>
				<p class="text-xl text-slate-400">{m.about_tagline()}</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-6 text-3xl font-semibold">{m.about_mission_title()}</h2>
				<p class="leading-relaxed text-slate-200">
					{m.about_mission_description()}
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-6 text-3xl font-semibold">{m.about_features_title()}</h2>
				<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
					<div class="glass-card p-6">
						<h3 class="mb-4 text-xl font-semibold">{m.about_features_coverage_title()}</h3>
						<p class="text-slate-200">{m.about_features_coverage_description()}</p>
					</div>
					<div class="glass-card p-6">
						<h3 class="mb-4 text-xl font-semibold">{m.about_features_community_title()}</h3>
						<p class="text-slate-200">{m.about_features_community_description()}</p>
					</div>
					<div class="glass-card p-6">
						<h3 class="mb-4 text-xl font-semibold">{m.about_features_stats_title()}</h3>
						<p class="text-slate-200">{m.about_features_stats_description()}</p>
					</div>
				</div>
			</section>

			<section class="mb-12 text-center" id="team">
				<h2 class="mb-6 text-3xl font-semibold">{m.about_team_title()}</h2>
				<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
					<div class="glass-card p-6">
						<h3 class="mb-2 text-xl font-semibold">mkpoli</h3>
						<p class="mb-4 text-slate-300">{m.about_team_roles_founder()}</p>
						<div class="flex justify-center gap-4">
							<a
								href="https://github.com/mkpoli"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:underline"
							>
								<IconGithub class="h-6 w-6" />
							</a>
							<a
								href="https://x.com/mkpoli"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:underline"
							>
								<IconX class="h-6 w-6" />
							</a>
						</div>
					</div>
					<div class="glass-card p-6">
						<h3 class="mb-2 text-xl font-semibold">swae gae pinoe</h3>
						<p class="mb-4 text-slate-300">{m.about_team_roles_editor()}</p>
						<div class="flex justify-center gap-4">
							<a
								href="https://twitch.tv/swaegaepinoe"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:underline"
							>
								<IconTwitch class="h-6 w-6" />
							</a>
						</div>
					</div>
					<div class="glass-card p-6">
						<h3 class="mb-2 text-xl font-semibold">XinghuiEnjoyer</h3>
						<p class="mb-4 text-slate-300">Consultant</p>
						<div class="flex justify-center gap-4">
							<a
								href="https://www.youtube.com/@XinghuiEnjoyer"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:underline"
							>
								<IconYoutube class="h-6 w-6" />
							</a>
							<a
								href="https://twitch.tv/xinghuienjoyer"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:underline"
							>
								<IconTwitch class="h-6 w-6" />
							</a>
						</div>
					</div>
					<div class="glass-card p-6">
						<h3 class="mb-2 text-xl font-semibold">Krihcity</h3>
						<p class="mb-4 text-slate-300">Chief Editor</p>
						<div class="flex justify-center gap-4">
							<a
								href="https://www.youtube.com/@krihcity"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:underline"
							>
								<IconYoutube class="h-6 w-6" />
							</a>
							<a
								href="https://www.twitch.tv/krihcity"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:underline"
							>
								<IconTwitch class="h-6 w-6" />
							</a>
						</div>
					</div>
					<div class="glass-card p-6 md:col-span-2">
						<h3 class="mb-2 text-xl font-semibold">{m.about_team_join_title()}</h3>
						<p class="mb-4 text-slate-300">{m.about_team_join_description()}</p>
						<a
							href="https://discord.gg/mY8DMatXM4"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-blue-400 hover:underline"
						>
							<IconDiscord class="h-6 w-6" />
							{m.about_team_join_discord()}
						</a>
					</div>
				</div>
			</section>

			<section class="mb-12 text-center">
				<h2 class="mb-6 text-3xl font-semibold">{m.about_links_title()}</h2>
				<div class="flex flex-col items-center gap-4">
					<a
						href="https://github.com/mkpoli/LemonTV"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-blue-400 hover:underline"
					>
						<IconGithub class="h-6 w-6" />
						{m.about_links_github()}
					</a>
					<a
						href="https://discord.gg/mY8DMatXM4"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-blue-400 hover:underline"
					>
						<IconDiscord class="h-6 w-6" />
						{m.about_links_discord()}
					</a>
				</div>
			</section>

			<footer class="mt-8 text-center text-sm text-slate-400">© 2025 LemonTV</footer>
		</div>
	</div>
</main>
