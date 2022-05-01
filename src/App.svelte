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

	let teamsPicked = false;

	function handleSubmit(e) {
		const formData = new FormData(e.target);
		console.log(formData);
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
		players[e.target.name - 1].isPlaying = false;
		players = players;
	}

	function handleSortTeams() {
		teamsPicked = true;
		// sort the players randomly for now
		const shuffledPlayers = fisherYatesShuffle(players);
		let team;

		shuffledPlayers.forEach(function(player, i) {
			team = i % 2 ? 'a' : 'b';
			player.team = team;
		});

		players = players;
	}

	/**
	 * https://bost.ocks.org/mike/shuffle/
	 * @param items
	 */
	function fisherYatesShuffle(items) {
		let currentIndex = items.length, randomItem, randomIndex;

		// While there remain elements to shuffle…
		while (currentIndex) {

			// Pick a remaining element…
			randomIndex = Math.floor(Math.random() * currentIndex--);

			// And swap it with the current element.
			randomItem = items[currentIndex];
			items[currentIndex] = items[randomIndex];
			items[randomIndex] = randomItem;
		}

		return items;
	}
</script>

<main>
	<AddPlayer on:submit={handleSubmit} />
	<PlayerPool bind:players={players} on:change={handlePlayerSelect} />
	<Teams bind:players={players} bind:teamsPicked={teamsPicked} on:click={handleSortTeams} />
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