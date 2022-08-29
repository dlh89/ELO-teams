<script>
	import { database } from '../../config/firebase';
	import { ref, onValue } from 'firebase/database';
	import { getDateString, getTimeString } from '../../lib/helpers';

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
	<ul>
		{#each fixtures.filter((fixture) => fixture.dateTime >= nowTimestamp) as fixture (fixture)}
			<li>
				{getDateString(fixture.dateTime)}
				{getTimeString(fixture.dateTime)}
			</li>
		{/each}
	</ul>

	<h2>Previous</h2>
	<ul>
		{#each fixtures.filter((fixture) => fixture.dateTime < nowTimestamp) as fixture (fixture)}
			<li>
				{getDateString(fixture.dateTime)}
				{getTimeString(fixture.dateTime)}
			</li>
		{/each}
	</ul>
</div>
