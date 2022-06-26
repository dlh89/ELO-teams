<script>
	import AddPlayer from './AddPlayer.svelte';
	import PlayerPool from './PlayerPool.svelte';
	import TeamsPool from './TeamsPool.svelte';
	import Teams from './Teams.svelte';
	import RecordResults from './RecordResults.svelte';
	import Modal, {getModal} from './Modal.svelte'
	import CalculateElo from './inc/CalculateElo.js';

	const calculateElo = new CalculateElo();

	let uid = 1;

	// Hardcoded players for testing - would come from database in practice
	let players = [
		{
			uid: uid++,
			name: 'David H',
			isPlaying: false,
			team: null,
			elo: 1000,
		},
		{
			uid: uid++,
			name: 'Max',
			isPlaying: false,
			team: null,
			elo: 2000,
		},
		{
			uid: uid++,
			name: 'Matt',
			isPlaying: false,
			team: null,
			elo: 1500
		},
	];

	let teamsPlayers = [];

	let teamsPicked = false;

	function handleSubmit(e) {
		const formData = new FormData(e.target);
		players = [
			...players,
			{ 
				uid: uid++,
				name: formData.get('playerName'),
				isPlaying: false,
				team: null,
				elo: calculateElo.startingElo,
			}
		];
		e.target.reset();
	}

	function handlePlayerSelect(e) {
		players[e.target.name - 1].isPlaying = true;
		players = players;
	}

	function handleRemovePlayer(e) {
		players[e.target.name - 1].isPlaying = false;
		players = players;
	}

	function handleSortTeams() {
		const activePlayers = getActivePlayers(players);
		let shuffledPlayers, arePlayersIdentical;
		
		// sort the players randomly for now
		do {
			shuffledPlayers = fisherYatesShuffle(activePlayers);
			arePlayersIdentical = areArraysIdentical(shuffledPlayers, teamsPlayers);
		} while (arePlayersIdentical && teamsPlayers.length > 1);
		
		let team;

		shuffledPlayers.forEach(function(player, i) {
			team = i % 2 ? 'a' : 'b';
			player.team = team;
		});

		teamsPlayers = shuffledPlayers;
		teamsPicked = true;
	}

	function getActivePlayers(players) {
		const activePlayers = players.filter(player => player.isPlaying);

		return activePlayers;
	}

	function areArraysIdentical(arr1, arr2) {
		var i = arr1.length;
		while (i--) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true
	}

	/**
	 * https://bost.ocks.org/mike/shuffle/
	 * @param items
	 */
	function fisherYatesShuffle(items) {
		let currentIndex = items.length, currentItem, randomIndex;

		// While there remain elements to shuffle…
		while (currentIndex) {

			// Pick a remaining element…
			randomIndex = Math.floor(Math.random() * currentIndex--);

			// And swap it with the current element.
			currentItem = items[currentIndex];
			items[currentIndex] = items[randomIndex];
			items[randomIndex] = currentItem;
		}

		return items;
	}

	function handleModifyPlayerPool() {
		teamsPicked = false;
	}

	function handleOpenRecordResults() {
		getModal().open();
	}

	function handleResults(e) {
		const teamAAverageElo = getAverageElo('a');
		const teamBAverageElo = getAverageElo('b');
		const teamAExpectedScore = calculateElo.getExpectedScore(teamBAverageElo, teamAAverageElo);
		const teamBExpectedScore = 1 - teamAExpectedScore;
		
		teamsPlayers = teamsPlayers.map((player) => {
			const actualScore = player.team === e.detail.winningTeam ? 1 : 0;
			const expectedScore = player.team === 'a' ? teamAExpectedScore : teamBExpectedScore;
			const newPlayerRating = calculateElo.getNewPlayerRating(player.elo, actualScore, expectedScore);
			player.elo = newPlayerRating;

			return player;
		});

		getModal().close();
	}

	function getAverageElo(teamName) {
		const combinedElo = teamsPlayers.reduce(
			(previousValue, currentValue) => currentValue.team === teamName ? previousValue + currentValue.elo : previousValue, 0
		);

		const playerCount = teamsPlayers.reduce(
			(previousValue, currentValue) => currentValue.team === teamName ? ++previousValue : previousValue, 0
		);

		const averageElo = combinedElo / playerCount;

		return averageElo
	}
</script>

<main>
	<h1>ELO Teams</h1>
	<AddPlayer on:submit={handleSubmit} />
	<div class="player-selection">
		<div class="players-container">
			<PlayerPool bind:players={players} bind:teamsPicked={teamsPicked} on:change={handlePlayerSelect} />
		</div>
		<div class="players-container">
			<TeamsPool bind:players={players} bind:teamsPicked={teamsPicked} on:change={handleRemovePlayer} />
		</div>
	</div>
	{#if !teamsPicked}
		{#if players.filter(player => player.isPlaying).length > 1 }
			<button on:click={handleSortTeams}>Sort teams</button>
		{/if}
	{/if}
	<Teams bind:teamsPicked={teamsPicked} bind:teamsPlayers={teamsPlayers} on:modifyPlayerPool={handleModifyPlayerPool} on:openRecordResults={handleOpenRecordResults} on:change={handleRemovePlayer} on:click={handleSortTeams} />

	<Modal>
		<RecordResults on:recordResults={handleResults} />
	</Modal>
</main>

<style>
	main {
		padding: 1em;
		max-width: 720px;
		margin: 0 auto;
	}

	h1 {
		font-size: 32px;
		margin-bottom: 30px;
	}

	:global(.heading-2) {
		font-size: 24px;
		font-weight: 800;
		margin-bottom: 18px;
	}

	.player-selection {
		display: flex;
		justify-content: space-between;
	}

	.players-container {
		background: #f3f3f3;
		width: 50%;
		padding: 20px;
	}

	/* @media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>