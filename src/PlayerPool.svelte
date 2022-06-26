<script>
	import { slide } from 'svelte/transition';
	export let players;
	export let teamsPicked;
</script>

{#if players.filter(player => !player.isPlaying).length}	
	<div transition:slide>
		<div class="heading-2">Player Pool</div>
		{#each players as player}
			{#if !player.isPlaying}	
			<div transition:slide|local>
				{#if teamsPicked}
					<p>{player.name} ({player.elo})</p>
				{:else}
					<input type="checkbox" name="{player.uid}" id="{player.uid}" on:change>
					<label for="{player.uid}">{player.name} ({player.elo})</label>
				{/if}
			</div>
			{/if}
		{/each}
	</div>
{/if}

<style>
	label {
		display: inline;
	}
</style>