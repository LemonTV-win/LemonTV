<!-- src/routes/(user)/admin/events/EventEdit.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Event, Organizer, EventOrganizer, Team, Player } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';

	let {
		event,
		organizers,
		eventOrganizers,
		teams,
		players,
		onCancel,
		onSuccess: onsuccess
	}: {
		event: Partial<Event>;
		organizers: Organizer[];
		eventOrganizers: EventOrganizer[];
		teams: Team[];
		players: Player[];
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let newEvent = $state({
		id: event.id || '',
		name: event.name || '',
		slug: event.slug || '',
		server: event.server || 'strinova',
		format: event.format || 'online',
		region: event.region || 'Global',
		status: event.status || 'upcoming',
		capacity: event.capacity || 0,
		date: event.date || new Date().toISOString().split('T')[0],
		image: event.image || '',
		official: event.official || false,
		organizers: eventOrganizers.map((eo) => eo.organizerId)
	});

	let teamPlayers = $state<
		Array<{
			teamId: string;
			playerId: string;
			role: 'main' | 'sub' | 'coach';
		}>
	>([]);

	// Load existing team players when editing an event
	$effect(() => {
		if (event.id) {
			fetch(`/api/events/${event.id}/team-players`)
				.then((res) => res.json())
				.then((data) => {
					teamPlayers = data.map((tp: any) => ({
						teamId: tp.teamId,
						playerId: tp.playerId,
						role: tp.role
					}));
				})
				.catch((e) => {
					console.error('Failed to load team players:', e);
				});
		}
	});

	let errorMessage = $state('');
	let successMessage = $state('');
	let dateRange = $state({ start: '', end: '' });

	// Initialize date range from event.date
	$effect(() => {
		if (event.date?.includes('/')) {
			const [start, end] = event.date.split('/');
			dateRange.start = start;
			dateRange.end = end;
		} else {
			dateRange.start = event.date || new Date().toISOString().split('T')[0];
			dateRange.end = event.date || new Date().toISOString().split('T')[0];
		}
	});

	// Update newEvent.date when dateRange changes
	$effect(() => {
		if (dateRange.start && dateRange.end) {
			newEvent.date =
				dateRange.start === dateRange.end ? dateRange.start : `${dateRange.start}/${dateRange.end}`;
		}
	});

	function validateDateRange() {
		if (!dateRange.start || !dateRange.end) {
			errorMessage = 'Both start and end dates are required';
			return false;
		}
		if (new Date(dateRange.start) > new Date(dateRange.end)) {
			errorMessage = 'Start date must be before or equal to end date';
			return false;
		}
		return true;
	}

	function addTeamPlayer() {
		teamPlayers = [
			...teamPlayers,
			{
				teamId: teams?.length > 0 ? teams[0].id : '',
				playerId: players?.length > 0 ? players[0].id : '',
				role: 'main'
			}
		];
	}

	function removeTeamPlayer(index: number) {
		teamPlayers = teamPlayers.filter((_, i) => i !== index);
	}

	function updateTeamPlayer(index: number, field: 'teamId' | 'playerId' | 'role', value: string) {
		teamPlayers = teamPlayers.map((tp, i) => (i === index ? { ...tp, [field]: value } : tp));
	}

	const statusOptions = ['upcoming', 'live', 'finished', 'cancelled', 'postponed'];
	const serverOptions = {
		strinova: 'Strinova',
		calabiyau: 'CalabiYau'
	};
	const formatOptions = ['online', 'lan', 'hybrid'];
	const regionOptions = ['Global', 'APAC', 'EU', 'CN', 'NA', 'SA', 'AF', 'OC'];
	const roleOptions = ['main', 'sub', 'coach'];
</script>

<form
	method="POST"
	action={event.id ? '?/update' : '?/create'}
	use:enhance={() => {
		return async ({ result }) => {
			if (!validateDateRange()) {
				return;
			}
			if (result.type === 'success') {
				// Update team players if event was created/updated successfully
				const eventId = (result.data as { id?: string })?.id || event.id;
				if (eventId) {
					const formData = new FormData();
					formData.append('eventId', eventId);
					formData.append('players', JSON.stringify(teamPlayers));
					await fetch('?/updateTeamPlayers', {
						method: 'POST',
						body: formData
					});
				}
				onsuccess();
				onCancel();
			} else if (result.type === 'failure') {
				errorMessage =
					typeof result.data?.error === 'string' ? result.data.error : 'Failed to save event';
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || 'An error occurred';
			}
		};
	}}
	class="flex h-full flex-col"
>
	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded-md bg-green-900/50 p-4 text-green-200" role="alert">
			<span class="block sm:inline">{successMessage}</span>
		</div>
	{/if}

	<div
		class="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		{#if event.id}
			<div>
				<label class="block text-sm font-medium text-slate-300" for="eventId">ID</label>
				<input
					type="text"
					id="eventId"
					name="id"
					value={event.id}
					readonly
					class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
				/>
			</div>
		{/if}

		<div>
			<label class="block text-sm font-medium text-slate-300" for="name">{m.name()}</label>
			<input
				type="text"
				id="name"
				name="name"
				bind:value={newEvent.name}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="slug">{m.slug()}</label>
			<input
				type="text"
				id="slug"
				name="slug"
				bind:value={newEvent.slug}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="server">{m.server()}</label>
			<select
				id="server"
				name="server"
				bind:value={newEvent.server}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each Object.entries(serverOptions) as [server, label]}
					<option value={server}>{label}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="format">{m.format()}</label>
			<select
				id="format"
				name="format"
				bind:value={newEvent.format}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each formatOptions as format}
					<option value={format}>{format}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="region">{m.region()}</label>
			<select
				id="region"
				name="region"
				bind:value={newEvent.region}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each regionOptions as region}
					<option value={region}>{region}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="status">{m.status()}</label>
			<select
				id="status"
				name="status"
				bind:value={newEvent.status}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each statusOptions as status}
					<option value={status}>{status}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="capacity">{m.capacity()}</label>
			<input
				type="number"
				id="capacity"
				name="capacity"
				bind:value={newEvent.capacity}
				required
				min="0"
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="date">{m.date()}</label>
			<div class="mt-1 grid grid-cols-2 gap-4">
				<div>
					<label class="block text-sm text-slate-400" for="dateStart">Start Date</label>
					<input
						type="date"
						id="dateStart"
						bind:value={dateRange.start}
						required
						class="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					/>
				</div>
				<div>
					<label class="block text-sm text-slate-400" for="dateEnd">End Date</label>
					<input
						type="date"
						id="dateEnd"
						bind:value={dateRange.end}
						required
						class="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					/>
				</div>
			</div>
			<input type="hidden" name="date" value={newEvent.date} />
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="image">{m.image()}</label>
			<ImageUpload bind:value={newEvent.image} prefix="events" />
			<input type="hidden" name="image" value={newEvent.image} />
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="organizers">Organizers</label>
			<select
				id="organizers"
				name="organizers"
				bind:value={newEvent.organizers}
				multiple
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each organizers as organizer}
					<option value={organizer.id}>{organizer.name}</option>
				{/each}
			</select>
			<p class="mt-1 text-sm text-slate-400">Hold Ctrl/Cmd to select multiple organizers</p>
		</div>

		<div class="flex items-center">
			<input
				type="checkbox"
				id="official"
				name="official"
				bind:checked={newEvent.official}
				class="h-4 w-4 rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
			/>
			<label for="official" class="ml-2 block text-sm text-slate-300">{m.official_event()}</label>
		</div>

		<div class="mb-4">
			<h3 class="mb-2 text-lg font-semibold">Team Players</h3>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each teamPlayers as teamPlayer, index}
					<div
						class="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 {index > 0
							? 'mt-4 border-t border-slate-700 pt-4'
							: ''}"
					>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="team-{index}">
								{m.team()}
							</label>
							<select
								id="team-{index}"
								bind:value={teamPlayer.teamId}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							>
								<option value="">{m.select_team()}</option>
								{#each teams as team}
									<option value={team.id}>{team.name}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="player-{index}">
								{m.player()}
							</label>
							<select
								id="player-{index}"
								bind:value={teamPlayer.playerId}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							>
								<option value="">{m.select_player()}</option>
								{#each players as player}
									<option value={player.id}>{player.name}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="role-{index}">
								{m.role()}
							</label>
							<select
								id="role-{index}"
								bind:value={teamPlayer.role}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							>
								{#each roleOptions as role}
									<option value={role}>{role}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center">
							<button
								type="button"
								class="mt-[1.625rem] text-red-400 hover:text-red-300"
								onclick={() => removeTeamPlayer(index)}
								title={m.remove()}
							>
								<IconParkSolidDelete class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
				{#if teamPlayers.length > 0}
					<div class="my-4 border-t border-slate-700"></div>
				{/if}
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
					onclick={addTeamPlayer}
				>
					<IconParkSolidAdd class="h-5 w-5" />
					<span>{m.add_new_player()}</span>
				</button>
			</div>
		</div>
	</div>

	<div class="mt-6 flex justify-end gap-4 border-t border-slate-700 pt-4">
		<button
			type="button"
			class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
			onclick={onCancel}
		>
			{m.cancel()}
		</button>
		<button
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{event.id ? m.update_event() : m.create_event()}
		</button>
	</div>
</form>
