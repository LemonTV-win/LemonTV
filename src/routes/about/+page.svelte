<script>
	import IconDiscord from '~icons/simple-icons/discord';
	import IconGithub from '~icons/simple-icons/github';
	import IconTwitch from '~icons/simple-icons/twitch';
	// You can add any necessary imports or reactive declarations here
</script>

<main class="glass-container mx-auto max-w-screen-lg p-12">
	<div class="glass rounded-lg p-8 hover:scale-100">
		<div class="mx-auto max-w-4xl">
			<section class="mb-16 text-center">
				<img src="/favicon.svg" alt="LemonTV Logo" class="mx-auto mb-6 h-24 w-24" />
				<h1 class="mb-4 text-4xl font-bold">About LemonTV</h1>
				<p class="text-xl text-slate-400">Your Ultimate Strinova E-Sports Hub</p>
			</section>
		</div>

		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-semibold">Our Mission</h2>
			<p class="leading-relaxed text-slate-200">
				LemonTV is a fan-made e-sports media platform created and maintained by passionate Strinova
				players. We're dedicated to bringing you the latest news, events, and community content from
				the world of Strinova. Our goal is to build a thriving community where players, fans, and
				enthusiasts can stay connected and informed.
			</p>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-semibold">What We Offer</h2>
			<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="glass-card p-6">
					<h3 class="mb-4 text-xl font-semibold">Live Coverage</h3>
					<p class="text-slate-200">
						Real-time updates on matches, tournaments, and competitive events
					</p>
				</div>
				<div class="glass-card p-6">
					<h3 class="mb-4 text-xl font-semibold">Community Hub</h3>
					<p class="text-slate-200">
						Connect with fellow Strinova players and share your experiences
					</p>
				</div>
				<div class="glass-card p-6">
					<h3 class="mb-4 text-xl font-semibold">Player Stats</h3>
					<p class="text-slate-200">
						Comprehensive statistics and performance tracking for competitive players
					</p>
				</div>
			</div>
		</section>

		<section class="mb-12 text-center" id="team">
			<h2 class="mb-6 text-3xl font-semibold">Our Team</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="glass-card p-6">
					<h3 class="mb-2 text-xl font-semibold">mkpoli</h3>
					<p class="mb-4 text-slate-300">Founder & Developer</p>
					<div class="flex justify-center gap-4">
						<a
							href="https://github.com/mkpoli"
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-400 hover:underline"
						>
							<IconGithub class="h-6 w-6" />
						</a>
					</div>
				</div>
				<div class="glass-card p-6">
					<h3 class="mb-2 text-xl font-semibold">swae gae pinoe</h3>
					<p class="mb-4 text-slate-300">Chief Editor</p>
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
				<div class="glass-card p-6 md:col-span-2">
					<h3 class="mb-2 text-xl font-semibold">Join Us!</h3>
					<p class="mb-4 text-slate-300">We're always looking for passionate contributors</p>
					<a
						href="https://discord.gg/mY8DMatXM4"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-blue-400 hover:underline"
					>
						<IconDiscord class="h-6 w-6" />
						Join our Discord
					</a>
				</div>
			</div>
		</section>

		<section class="mb-12 text-center">
			<h2 class="mb-6 text-3xl font-semibold">Get in Touch</h2>
			<p class="text-slate-200">
				Want to contribute or have suggestions? Join the
				<a
					href="https://discord.gg/mY8DMatXM4"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-400 hover:underline">Strinova Esports Hub</a
				> Discord community
			</p>
		</section>

		<section class="mb-12 text-center">
			<h2 class="mb-6 text-3xl font-semibold">Links</h2>
			<div class="flex flex-col items-center gap-4">
				<a
					href="https://github.com/mkpoli/LemonTV"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-blue-400 hover:underline"
				>
					<IconGithub class="h-6 w-6" />
					GitHub Repository
				</a>
				<a
					href="https://discord.gg/mY8DMatXM4"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-blue-400 hover:underline"
				>
					<IconDiscord class="h-6 w-6" />
					Discord Community
				</a>
			</div>
		</section>

		<footer class="mt-8 text-center text-sm text-slate-400">© 2025 LemonTV</footer>
	</div>
</main>
