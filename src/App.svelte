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
		},
		{
			uid: uid++,
			name: 'Max',
			isPlaying: false,
		},
		{
			uid: uid++,
			name: 'Matt',
			isPlaying: false,
		},
	];

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
</script>

<main>
	<AddPlayer on:submit={handleSubmit} />
	<PlayerPool bind:players={players} on:change={handlePlayerSelect} />
	<Teams bind:players={players} on:change="{handleRemovePlayer}" />
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