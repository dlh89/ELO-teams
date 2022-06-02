<script>
	import { createEventDispatcher } from 'svelte';
	export let players;
	export let teamsPlayers;
	export let teamsPicked;

	const dispatch = createEventDispatcher();

	function modifyPlayerPool() {
		dispatch('modifyPlayerPool');
	}
</script>

{#if !teamsPicked}
	<div class="teams__pool">
		{#if players.filter(player => player.isPlaying).length }
			<div class="heading-2">Active players</div>
			{#each players as player}
				{#if player.isPlaying}
					<div>
						<input type="checkbox" name="{player.uid}" id="{player.uid}" checked on:change>
						<label for="{player.uid}">{player.name}</label>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
	{#if players.filter(player => player.isPlaying).length > 1 }
		<button on:click>Sort teams</button>
	{/if}
{:else}
	<div class="teams">
		<div class="teams__team">
			<div class="teams__label">Team A</div>
			<div class="teams__playerbox">
				<ul>
				{#each teamsPlayers as player}
					{#if player.team === 'a'}
						<li>{player.name}</li>
					{/if}
				{/each}
				</ul>
			</div>
		</div>
		<div class="teams__team">
			<div class="teams__label">Team B</div>
			<div class="teams__playerbox">
				<ul>
				{#each teamsPlayers as player}
					{#if player.team === 'b'}
						<li>{player.name}</li>
					{/if}
				{/each}
				</ul>
			</div>
		</div>
	</div>
	<button on:click>Reshuffle teams</button>
	<button on:click={modifyPlayerPool}>Edit players</button>
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