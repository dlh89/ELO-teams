<script>
	import { slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	export let players;

	const dispatch = createEventDispatcher();
	const playerSelect = (player, isPlaying) => {
		dispatch('playerSelect', { player, isPlaying })
	};
</script>

<div>
	{#each players as player}
		{#if !player.isPlaying}	
		<div transition:slide|local>
			<input type="checkbox" name="{player.name}" id="{player.uid}" on:change={() => playerSelect(player, true)}>
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