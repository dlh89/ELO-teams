<script>
	import AddPlayer from './AddPlayer.svelte';
	import PlayerPool from './PlayerPool.svelte';
	import Teams from './Teams.svelte';

	let uid = 1;
	let players = [
		{
			uid: uid++,
			name: 'David H',
			isPlaying: false,
			team: null,
		},
		{
			uid: uid++,
			name: 'Max',
			isPlaying: false,
			team: null,
		},
		{
			uid: uid++,
			name: 'Matt',
			isPlaying: false,
			team: null,
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
			}
		];
	}

	function handlePlayerSelect(e) {
		players[e.target.name - 1].isPlaying = true;
		players = players;
	}

	function handleRemovePlayer(e) {
		console.log('remove');
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
</script>

<main>
	<AddPlayer on:submit={handleSubmit} />
	<PlayerPool bind:players={players} on:change={handlePlayerSelect} />
	<Teams bind:players={players} bind:teamsPicked={teamsPicked} bind:teamsPlayers={teamsPlayers} on:click={handleSortTeams} on:change={handleRemovePlayer} />
</main>

<style>
	main {
		padding: 1em;
		max-width: 720px;
		margin: 0 auto;
	}

	/* @media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>