<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { crossfade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    export let players;
	export let teamsPicked;

    const dispatch = createEventDispatcher();
    const [send, receive] = crossfade({
        duration: 400,
    });

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
                <div class="heading-2" transition:fade>Player Pool</div>
                <div>
                    {#each playerPool as player (player)}
                            <label class="block-label" for="{player.uid}" in:receive out:send animate:flip>
                                <input type="checkbox" name="{player.uid}" id="{player.uid}" on:change={() => playerSelect(player.uid, true)}>
                                {player.name} ({player.elo})
                            </label>
                    {/each}
                </div>
            {/if}
        </div>
    {#if !teamsPicked}
        <div class="players-container" >
            {#if selectedPlayers.length }
                <div class="heading-2" transition:fade>Active Players</div>
                <div>
                    {#each selectedPlayers as player (player)}
                        <label class="block-label" for="{player.uid}" in:receive out:send animate:flip>
                            <input type="checkbox" name="{player.uid}" id="{player.uid}" checked on:change={() => playerSelect(player.uid, false)}>
                            {player.name} ({player.elo})
                        </label>
                    {/each}
                </div>
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

    .block-label {
        display: block;
    }
</style>