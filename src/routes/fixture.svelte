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
    import { getRandomTeams } from '../lib/helpers';
    import { database } from '../config/firebase.js';
    import { ref, onValue } from "firebase/database";

    const [send, receive] = crossfade({
        duration: 200,
    });

	let players = [];
    const playersRef = ref(database, 'players');

    onValue(playersRef, (snapshot) => {
        const data = snapshot.val();

        players = Object.keys(data).map((player, i) => {
            data[player].uid = i;
            data[player].isPlaying = false;
            data[player].team = null;
            return data[player];
        });
    });

    $: playerPool = players.filter(player => !player.isPlaying);
	$: selectedPlayers = players.filter(player => player.isPlaying);

    /**
     * @param {number} uid
     * @param {boolean} isPlaying
     */
    function playerSelect(uid, isPlaying) {
        players[uid].isPlaying = isPlaying;
    }

    function handleSortTeams() {
        // Sort randomly for now
        const randomTeams = getRandomTeams(selectedPlayers.length);

		selectedPlayers.forEach(function(player, i) {
			player.team = randomTeams[i];
		});

        players = [...players];
        teamsPicked.set(true);
    }
</script>

<div class="row">
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
    {#if !$teamsPicked && selectedPlayers.length > 1}
        <button on:click="{handleSortTeams}">Sort teams</button>
    {/if}
    <Teams teamsPlayers={selectedPlayers} on:click={handleSortTeams} />
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