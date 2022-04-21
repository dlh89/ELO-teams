<script>
	export let players;
</script>

<div class="teams">
	<div class="teams__team">
		<div class="teams__label">Team A</div>
		<div class="teams__playerbox">
			<ul>
				{#each players as player}
					{#if player.isPlaying}
						<input type="checkbox" name="{player.uid}" id="{player.uid}" checked on:change>
						<label for="{player.uid}">{player.name}</label>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
	<div class="teams__team">
		<div class="teams__label">Team B</div>
		<div class="teams__playerbox">
			
		</div>
	</div>
</div>

<style>
	.teams {
		display: flex;
	}

	.teams__team {
		border: 1px solid #707070;
	}

	.teams__label {
		font-size: 20px;
		font-weight: 800;
	}
</style>