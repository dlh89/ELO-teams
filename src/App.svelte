<script>
	import AddPlayer from './AddPlayer.svelte';
	import PlayerPool from './PlayerPool.svelte';
	import Teams from './Teams.svelte';

	let players = [
		'David H',
		'Max',
		'Matt',
	];

	function handleSubmit(data) {
		players = [...players, data.detail.name];
	}
</script>

<main>
	<AddPlayer on:submit={handleSubmit} />
	<PlayerPool bind:players={players} />
	<Teams />
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