<script>
	import { database } from '../../config/firebase';
	import { ref, onValue } from 'firebase/database';
	import { getDateString, getTimeString } from '../../lib/helpers';
	import { page } from '$app/stores';

	let fixtures = [];
	const fixturesRef = ref(database, '/fixtures');

	onValue(fixturesRef, (snapshot) => {
		const data = snapshot.val();

		if (data) {
			const fixtureIds = Object.keys(data);

			fixtures = fixtureIds.map((id) => {
				return {
					id,
					dateTime: data[id].dateTime,
					players: data[id].players,
				};
			});
		}
	});

	const nowTimestamp = new Date().valueOf();

	const notice = $page.url.searchParams.get('notice');
</script>

<div class="row">
	{#if notice}
		{#if notice === 'fixture-save'}
			<div class="notice">Fixture saved successfully.</div>
		{:else if notice === 'fixture-delete'}
			<div class="notice">Fixture deleted.</div>
		{/if}
	{/if}
	<h1>Fixtures</h1>
	<a href="/fixtures/new">New fixture</a>

	<h2>Upcoming</h2>
	<ul>
		{#each fixtures.filter((fixture) => fixture.dateTime >= nowTimestamp) as fixture (fixture)}
			<li>
				<a href="/fixtures/{fixture.id}">
					{getDateString(fixture.dateTime)}
					{getTimeString(fixture.dateTime)}
				</a>
			</li>
		{/each}
	</ul>

	<h2>Previous</h2>
	<ul>
		{#each fixtures.filter((fixture) => fixture.dateTime < nowTimestamp) as fixture (fixture)}
			<li>
				<a href="/fixtures/{fixture.id}">
					{getDateString(fixture.dateTime)}
					{getTimeString(fixture.dateTime)}
				</a>
			</li>
		{/each}
	</ul>
</div>
