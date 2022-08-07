<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit';
    import authStore from '../stores/authStore';
	import CalculateElo from '../lib/CalculateElo.js';

    export const load: Load = ({ props }) => {
        let shouldRedirect = false;
        authStore.subscribe(async ({ isLoggedIn }) => {
            if (!isLoggedIn) {
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

	const calculateElo = new CalculateElo();

    function handleSubmit(e) {
        e.preventDefault();
		const formData = new FormData(e.target);

        // TODO save to database
		players = [
			...players,
			{ 
				uid: uid++,
				name: formData.get('playerName'),
				isPlaying: false,
				team: null,
				elo: calculateElo.startingElo,
			}
		];
		e.target.reset();
	}
</script>

<div class="row">
    <h1>Players</h1>
    <div>
        <form on:submit={handleSubmit}>
            <label for="player js-add-player-btn">Add a player:</label>
            <input type="text" id="player" name="playerName" placeholder="Player name">
            <input type="submit" value="Add player">
        </form>
    </div>
    <div>
        {#if players.length }
            <div>
                <ul>
                    {#each players as player (player)}
                        <li>
                            <a href="/players/{player.uid}">{player.name} ({player.elo})</a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
</div>