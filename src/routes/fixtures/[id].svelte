<script>
	import { database } from '../../config/firebase.js';
	import { onValue, ref, remove } from 'firebase/database';
	import { goto } from '$app/navigation';
	import { getDateString, getTimeString } from '../../lib/helpers';
	import Fixture from '../../components/Fixture.svelte';
	import { claim_svg_element } from 'svelte/internal';

	export let fixture, id;
	let notice = '';
	let players = fixture.players;

	const playersRef = ref(database, 'players');
	const activePlayersIds = players.map((player) => player.id);

	onValue(playersRef, (snapshot) => {
		const data = snapshot.val();
		if (data) {
			const playerIds = Object.keys(data);
			let unusedPlayers = playerIds.filter(
				(id) => !activePlayersIds.includes(id)
			);

			unusedPlayers = unusedPlayers.map((id) => {
				return {
					id,
					...data[id],
					isPlaying: false,
					team: null,
				};
			});

			players = players.concat(unusedPlayers);
		}
	});

	function handleDelete() {
		const isConfirmed = window.confirm(
			'Are you sure you want to permanently delete this fixture?'
		);
		if (isConfirmed) {
			// TODO success message/redirect?
			remove(ref(database, `fixtures/${id}`));
			goto('/fixtures?notice=fixture-delete');
		}
	}

	const date = getDateString(fixture.dateTime);
	const time = getTimeString(fixture.dateTime);
</script>

<div class="row">
	<Fixture title="Edit fixture" {date} {time} teamsPicked={true} {players} />
	<button on:click={handleDelete}>Delete fixture</button>
</div>
