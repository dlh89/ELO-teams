<script>
	import { database } from '../../config/firebase';
	import { ref, onValue } from 'firebase/database';

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
			console.log('fixtures:', fixtures);
		}
	});
</script>

<div class="row">
	<h1>Fixtures</h1>
	<a href="/fixtures/fixture">New fixture</a>

	<h2>Upcoming</h2>
	{#each fixtures as fixture (fixture)}
		{fixture.players}
	{/each}

	<h2>Previous</h2>
</div>
