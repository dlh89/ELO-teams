<script>
	import AddPlayer from './AddPlayer.svelte';
	import PlayerPool from './PlayerPool.svelte';
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

	function handleRecordResults() {
		// TODO trigger displaying the component?
		getModal().open();
	}
</script>

<main>
	<h1>ELO Teams</h1>
	<AddPlayer on:submit={handleSubmit} />
	<PlayerPool bind:players={players} bind:teamsPicked={teamsPicked} on:change={handlePlayerSelect} />
	<Teams bind:players={players} bind:teamsPicked={teamsPicked} bind:teamsPlayers={teamsPlayers} on:click={handleSortTeams} on:modifyPlayerPool={handleModifyPlayerPool} on:recordResults={handleRecordResults} on:change={handleRemovePlayer} />
	<RecordResults bind:teamsPlayers={teamsPlayers} />
	<Modal>
		<p>Which team won?</p>
		<button>Team A</button>
		<button>Team B</button>
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

	/* @media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>