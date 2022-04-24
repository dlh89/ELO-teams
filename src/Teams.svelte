<script>
	export let players;
	export let teamsPicked;
</script>

{#if !teamsPicked}
	<div class="teams__pool">
		<div class="teams__label">Active players</div>
		{#each players as player}
			{#if player.isPlaying}
				<div>
					<input type="checkbox" name="{player.uid}" id="{player.uid}" checked on:change>
					<label for="{player.uid}">{player.name}</label>
				</div>
			{/if}
		{/each}
	</div>
	<button on:click>Sort teams</button>
{:else}
	<div class="teams">
		<div class="teams__team">
			<div class="teams__label">Team A</div>
			<div class="teams__playerbox">
				<ul>
				{#each players as player}
					{#if player.isPlaying && player.team === 'a'}
						<li>{player.name}</li>
					{/if}
				{/each}
				</ul>
			</div>
		</div>
		<div class="teams__team">
			<div class="teams__label">Team B</div>
			<div class="teams__playerbox">
				{#each players as player}
					{#if player.isPlaying && player.team === 'b'}
						<div>
							<input type="checkbox" name="{player.uid}" id="{player.uid}" checked>
							<label for="{player.uid}">{player.name}</label>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.teams {
		display: flex;
	}

	.teams__team {
		border: 1px solid #707070;
		flex-grow: 1;
	}

	.teams__label {
		font-size: 20px;
		font-weight: 800;
	}
</style>