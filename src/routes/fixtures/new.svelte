<script lang="ts">
	import Fixture from '../../components/Fixture.svelte';
	import { database } from '../../config/firebase.js';
	import { ref, onValue } from 'firebase/database';
	import type { PlayerType } from '../../types/player.type';

	let teamsPicked = false;
	let players: PlayerType[] = [];

	const playersRef = ref(database, 'players');

	onValue(playersRef, (snapshot) => {
		const data = snapshot.val();

		if (data) {
			const playerIds = Object.keys(data);
			players = playerIds.map((id) => {
				return {
					id,
					...data[id],
					isPlaying: false,
					team: null,
				};
			});
		}
	});
</script>

<div class="row">
	<Fixture title="New fixture" {teamsPicked} {players} id={false} />
</div>
