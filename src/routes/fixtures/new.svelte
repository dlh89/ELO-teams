<script>
	import Fixture from '../../components/Fixture.svelte';
	import { getDateString, getTimeString } from '../../lib/helpers';
	import { database } from '../../config/firebase.js';
	import { ref, onValue } from 'firebase/database';

	const nowDate = new Date().valueOf();
	let date = getDateString(nowDate);
	let time = getTimeString(nowDate);

	let teamsPicked = false;
	let players = [];

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
	<Fixture
		title="New fixture"
		{date}
		{time}
		{teamsPicked}
		{players}
		id={false}
	/>
</div>
