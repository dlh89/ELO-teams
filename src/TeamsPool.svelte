<script>
    export let players;
	export let teamsPicked;
</script>

{#if !teamsPicked}
	<div class="teams__pool" >
		{#if players.filter(player => player.isPlaying).length }
			<div class="heading-2">Active players</div>
			{#each players as player}
				{#if player.isPlaying}
					<div>
						<input type="checkbox" name="{player.uid}" id="{player.uid}" checked on:change>
						<label for="{player.uid}">{player.name} ({player.elo})</label>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
{/if}