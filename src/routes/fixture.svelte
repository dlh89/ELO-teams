<script>
	import { fade } from 'svelte/transition';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import Teams from '../components/Teams.svelte';
	import { getRandomTeams } from '../lib/helpers';
	import { database } from '../config/firebase.js';
	import { ref, onValue } from 'firebase/database';

	const [send, receive] = crossfade({
		duration: 200,
	});

	let teamsPicked = false;
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
					isPlaying: false,
					team: null,
				};
			});
		}
	});

	$: playerPool = players.filter((player) => !player.isPlaying);
	$: selectedPlayers = players.filter((player) => player.isPlaying);

	/**
	 * @param {number} id
	 * @param {boolean} isPlaying
	 */
	function playerSelect(id, isPlaying) {
		const player = players.find((player) => player.id === id);
		if (player) {
			player.isPlaying = isPlaying;
			players = [...players];
		}
	}

	function handleSortTeams() {
		// Sort randomly for now
		const randomTeams = getRandomTeams(selectedPlayers.length);

		selectedPlayers.forEach(function (player, i) {
			player.team = randomTeams[i];
		});

		players = [...players];
		teamsPicked = true;
	}

	function modifyPlayerPool() {
		teamsPicked = false;
	}
</script>

<div class="row">
	<h1>New Fixture</h1>
	<div class="player-selection">
		<div class="players-container">
			{#if playerPool.length}
				<div class="heading-2" transition:fade|local>Player Pool</div>
				<div>
					{#each playerPool as player (player)}
						<label
							class="block-label"
							for={player.id}
							in:receive
							out:send
							animate:flip
						>
							<input
								type="checkbox"
								name={player.id}
								id={player.id}
								on:change={() => playerSelect(player.id, true)}
								disabled={teamsPicked}
							/>
							{player.name} ({player.elo})
						</label>
					{/each}
				</div>
			{/if}
		</div>
		<div class="players-container">
			{#if selectedPlayers.length}
				<div class="heading-2" transition:fade|local>
					Active Players
				</div>
				<div>
					{#each selectedPlayers as player (player)}
						<label
							class="block-label"
							for={player.id}
							in:receive
							out:send
							animate:flip
						>
							<input
								type="checkbox"
								name={player.id}
								id={player.id}
								checked
								on:change={() => playerSelect(player.id, false)}
								disabled={teamsPicked}
							/>
							{player.name} ({player.elo})
						</label>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	{#if !teamsPicked && selectedPlayers.length > 1}
		<button on:click={handleSortTeams}>Sort teams</button>
	{/if}
	<Teams
		teamsPlayers={selectedPlayers}
		on:click={handleSortTeams}
		{teamsPicked}
		on:modifyPlayerPool={modifyPlayerPool}
	/>
</div>

<style>
	.player-selection {
		display: flex;
		justify-content: space-between;
		background: #f3f3f3;
	}

	.players-container {
		width: 50%;
		padding: 20px;
	}

	.block-label {
		display: block;
	}
</style>
