<script>
	export let players;
	export let teamsPicked;
</script>

<div>
	<div class="heading-2">Player Pool</div>
	{#if players.filter(player => !player.isPlaying).length}	
		{#each players as player}
			{#if !player.isPlaying}	
				<div>
					{#if teamsPicked}
						<p>{player.name} ({player.elo})</p>
					{:else}
						<input type="checkbox" name="{player.uid}" id="{player.uid}" on:change>
						<label for="{player.uid}">{player.name} ({player.elo})</label>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>

<style>
	label {
		display: inline;
	}
</style>