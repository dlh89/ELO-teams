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

	function handleSubmit(data) {
		players = [
			...players,
			{ 
				uid: uid++,
				name: data.detail.name,
				isPlaying: true,
			}
		];
	}

	function handlePlayerSelect(data) {
		data.detail.player.isPlaying = data.detail.isPlaying;
		players = players;
	}
</script>

<main>
	<AddPlayer on:submit={handleSubmit} />
	<PlayerPool bind:players={players} on:playerSelect={handlePlayerSelect} />
	<Teams bind:players={players} />
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