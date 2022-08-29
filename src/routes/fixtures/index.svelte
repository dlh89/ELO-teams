<script>
	import { database } from '../../config/firebase';
	import { ref, onValue } from 'firebase/database';
	import {
		getCurrentDateString,
		getCurrentTimeString,
	} from '../../lib/helpers';

	let fixtures = [];
	const fixturesRef = ref(database, '/fixtures');

	onValue(fixturesRef, (snapshot) => {
		const data = snapshot.val();

		if (data) {
			const fixtureIds = Object.keys(data);

			fixtures = fixtureIds.map((id) => {
				return {
					dateTime: data[id].dateTime,
					players: data[id].players,
				};
			});
		}
	});

	const nowTimestamp = new Date().valueOf();
</script>

<div class="row">
	<h1>Fixtures</h1>
	<a href="/fixtures/fixture">New fixture</a>

	<h2>Upcoming</h2>
	{#each fixtures.filter((fixture) => fixture.dateTime >= nowTimestamp) as fixture (fixture)}
		{getCurrentDateString(fixture.dateTime)}
		{getCurrentTimeString(fixture.dateTime)}
	{/each}

	<h2>Previous</h2>
	{#each fixtures.filter((fixture) => fixture.dateTime < nowTimestamp) as fixture (fixture)}
		{getCurrentDateString(fixture.dateTime)}
		{getCurrentTimeString(fixture.dateTime)}
	{/each}
</div>
