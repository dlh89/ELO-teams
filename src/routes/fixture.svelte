<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit';
    import authStore from '../stores/authStore';

    export const load: Load = ({ props }) => {
        let shouldRedirect = false;
        authStore.subscribe(async ({ isLoggedIn }) => {
            if (!isLoggedIn ) {
                shouldRedirect = true;
            }
        });

        if (shouldRedirect) {
            return {
                status: 302,
                redirect: '/login',
            }
        }

		return { props }
	}
</script>

<script>
    import { fade } from 'svelte/transition';
    import { crossfade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { teamsPicked } from '../stores/teamsStore';
    import Teams from '../components/Teams.svelte';
    import { fisherYatesShuffle } from '../lib/helpers';

    const [send, receive] = crossfade({
        duration: 400,
    });

	let uid = 1;

    // TODO get players from database
	let players = [
		{
			uid: uid++,
			name: 'David H',
			isPlaying: false,
			team: null,
			elo: 1000,
		},
		{
			uid: uid++,
			name: 'Max',
			isPlaying: false,
			team: null,
			elo: 2000,
		},
		{
			uid: uid++,
			name: 'Matt',
			isPlaying: false,
			team: null,
			elo: 1500
		},
	];

	$: playerPool = players.filter(player => !player.isPlaying);
	$: selectedPlayers = players.filter(player => player.isPlaying);

    /**
     * @param {number} uid
     * @param {boolean} isPlaying
     */
    function playerSelect(uid, isPlaying) {
        players[uid - 1].isPlaying = isPlaying;
    }

    function handleSortTeams() {
        let shuffledPlayers;
        shuffledPlayers = fisherYatesShuffle(selectedPlayers);

		let team;

        // Sort randomly for now
		shuffledPlayers.forEach(function(player, i) {
			team = i % 2 ? 'a' : 'b';
			player.team = team;
		});

        teamsPicked.set(true);
    }
</script>

<h1>New Fixture</h1>
<div class="player-selection">
    <div class="players-container" >
        {#if playerPool.length }
            <div class="heading-2" transition:fade|local>Player Pool</div>
            <div>
                {#each playerPool as player (player)}
                    <label class="block-label" for="{player.uid}" in:receive out:send animate:flip>
                        <input type="checkbox" name="{player.uid}" id="{player.uid}" on:change={() => playerSelect(player.uid, true)} disabled="{$teamsPicked}">
                        {player.name} ({player.elo})
                    </label>
                {/each}
            </div>
        {/if}
    </div>
    <div class="players-container" >
        {#if selectedPlayers.length }
            <div class="heading-2" transition:fade|local>Active Players</div>
            <div>
                {#each selectedPlayers as player (player)}
                    <label class="block-label" for="{player.uid}" in:receive out:send animate:flip>
                        <input type="checkbox" name="{player.uid}" id="{player.uid}" checked on:change={() => playerSelect(player.uid, false)} disabled="{$teamsPicked}">
                        {player.name} ({player.elo})
                    </label>
                {/each}
            </div>
        {/if}
    </div>
</div>
{#if !$teamsPicked}
    <button on:click="{handleSortTeams}">Sort teams</button>
{/if}
<Teams teamsPlayers={selectedPlayers} />

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