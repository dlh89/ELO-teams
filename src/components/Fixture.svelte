<script>
	import { fade } from 'svelte/transition';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import Teams from '../components/Teams.svelte';
	import { getRandomTeams } from '../lib/helpers';
	import { database } from '../config/firebase.js';
	import { ref, push, update } from 'firebase/database';
	import { goto } from '$app/navigation';

	export let dateTime, title, players, teamsPicked, date, time, id;

	const [send, receive] = crossfade({
		duration: 200,
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
		let teamsHaveChanged = false;

		while (!teamsHaveChanged) {
			// Sort randomly for now
			const randomTeams = getRandomTeams(selectedPlayers.length);

			selectedPlayers.forEach(function (player, i) {
				if (player.team !== randomTeams[i]) {
					teamsHaveChanged = true;
				}
				player.team = randomTeams[i];
			});
		}

		players = [...players];
		teamsPicked = true;
	}

	function modifyPlayerPool() {
		teamsPicked = false;
	}

	function saveFixture() {
		const dateTime = new Date(`${date} ${time}`).valueOf();

		if (id) {
			update(ref(database, `fixtures/${id}`), {
				players: selectedPlayers,
				dateTime,
			});
		} else {
			push(ref(database, 'fixtures/'), {
				players: selectedPlayers,
				dateTime,
			});
		}

		goto('/fixtures?notice=fixture-save');
	}

	function recordResult(data) {
		if (!id) {
			return;
		}

		const result = {
			winningTeam: data.detail.winningTeam,
		};

		update(ref(database, `fixtures/${id}`), {
			result: result,
		});
	}

	function handleDateChange(e) {
		date = e.target.value;
	}

	function handleTimeChange(e) {
		time = e.target.value;
	}

	const isPassed = new Date().valueOf() > dateTime;
</script>

<div>
	<h1>{title}</h1>
	<input type="date" value={date} min={date} on:change={handleDateChange} />
	<input type="time" value={time} on:change={handleTimeChange} />
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
		{isPassed}
		on:click={handleSortTeams}
		{teamsPicked}
		on:modifyPlayerPool={modifyPlayerPool}
		on:saveFixture={saveFixture}
		on:recordResult={recordResult}
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
