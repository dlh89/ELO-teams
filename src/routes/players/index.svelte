<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import authStore from '../../stores/authStore';
	import CalculateElo from '../../lib/CalculateElo.js';
	import { database } from '../../config/firebase.js';
	import { ref, push, onValue } from 'firebase/database';

	export const load: Load = ({ props }) => {
		let shouldRedirect = false;
		authStore.subscribe(async ({ isLoggedIn }) => {
			if (!isLoggedIn) {
				shouldRedirect = true;
			}
		});

		if (shouldRedirect) {
			return {
				status: 302,
				redirect: '/login',
			};
		}

		return { props };
	};
</script>

<script>
	let players = [];
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
		e.preventDefault();
		const formData = new FormData(e.target);

		push(ref(database, 'players/'), {
			name: formData.get('playerName'),
			elo: calculateElo.startingElo,
		});

		e.target.reset();
	}
</script>

<div class="row">
	<h1>Players</h1>
	<div>
		<form on:submit={handleSubmit}>
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
