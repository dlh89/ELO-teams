<script>
	import { slide } from 'svelte/transition';
	export let players;
</script>

<div>
	<div>Player Pool</div>
	{#each players as player}
		{#if !player.isPlaying}	
		<div transition:slide|local>
			<input type="checkbox" name="{player.uid}" id="{player.uid}" on:change>
			<label for="{player.uid}">{player.name}</label>
		</div>
		{/if}
	{/each}
</div>

<style>
	label {
		display: inline;
	}
</style>