<script context="module" lang="ts">
	import CalculateElo from '../../lib/CalculateElo.js';
	import { database } from '../../config/firebase.js';
	import { ref, push, onValue } from 'firebase/database';
	import { page } from '$app/stores';
	import type { PlayerType } from '../../types/player.type';
</script>

<script lang="ts">
	let players: PlayerType[];
	const playersRef = ref(database, 'players');

	onValue(playersRef, (snapshot) => {
		const data = snapshot.val();
		if (data) {
			const playerIds = Object.keys(data);
			players = playerIds.map((id) => {
				return {
					id,
					...data[id],
				};
			});
		}
	});

	const calculateElo = new CalculateElo();

	function handleSubmit(e) {
		const formData = new FormData(e.target);

		push(ref(database, 'players/'), {
			name: formData.get('playerName'),
			elo: calculateElo.startingElo,
		});

		e.target.reset();
	}

	const notice = $page.url.searchParams.get('notice');
</script>

<div class="row">
	{#if notice}
		{#if notice === 'player-delete'}
			<div class="notice">Player deleted successfully.</div>
		{/if}
	{/if}
	<h1>Players</h1>
	<div>
		<form on:submit|preventDefault={handleSubmit}>
			<label for="player js-add-player-btn">Add a player:</label>
			<input
				type="text"
				id="player"
				name="playerName"
				placeholder="Player name"
			/>
			<input type="submit" value="Add player" />
		</form>
	</div>
	<div>
		{#if players && players.length}
			<div>
				<ul>
					{#each players as { id, name, elo }}
						{#if name}
							<li>
								<a href="/players/{id}">{name} ({elo})</a>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
