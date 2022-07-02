<script>
    import { createEventDispatcher } from 'svelte';
    export let players;
	export let teamsPicked;

    const dispatch = createEventDispatcher();

	$: playerPool = players.filter(player => !player.isPlaying);
	$: selectedPlayers = players.filter(player => player.isPlaying);

    function playerSelect(uid, isPlaying) {
        dispatch('playerSelect', {
            uid: uid,
            isPlaying: isPlaying,
        });
    }
</script>

<div class="player-selection">
        <div class="players-container" >
            {#if playerPool.length }
                <div class="heading-2">Player Pool</div>
                {#each playerPool as player}
                    <div>
                        {#if teamsPicked}
                            <p>{player.name} ({player.elo})</p>
                        {:else}
                            <input type="checkbox" name="{player.uid}" id="{player.uid}" on:change={() => playerSelect(player.uid, true)}>
                            <label for="{player.uid}">{player.name} ({player.elo})</label>
                        {/if}
                    </div>
                {/each}
            {/if}
        </div>
    {#if !teamsPicked}
        <div class="players-container" >
            {#if selectedPlayers.length }
                <div class="heading-2">Active Players</div>
                {#each selectedPlayers as player}
                    <div>
                        <input type="checkbox" name="{player.uid}" id="{player.uid}" on:change={() => playerSelect(player.uid, false)}>
                        <label for="{player.uid}">{player.name} ({player.elo})</label>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    .player-selection {
		display: flex;
		justify-content: space-between;
		background: #f3f3f3;
	}

    .players-container {
		width: 50%;
		padding: 20px;
	}
</style>