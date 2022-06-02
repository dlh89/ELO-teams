<script>
	import { slide } from 'svelte/transition';
	export let players;
	export let teamsPicked;
</script>

<div>
	<div class="heading-2">Player Pool</div>
	{#each players as player}
		{#if !player.isPlaying}	
		<div transition:slide|local>
			{#if teamsPicked}
				<p>{player.name}</p>
			{:else}
				<input type="checkbox" name="{player.uid}" id="{player.uid}" on:change>
				<label for="{player.uid}">{player.name}</label>
			{/if}
		</div>
		{/if}
	{/each}
</div>

<style>
	label {
		display: inline;
	}
</style>