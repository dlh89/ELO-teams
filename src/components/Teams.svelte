<script>
	import { createEventDispatcher } from 'svelte';
	import RecordResults from './RecordResults.svelte';
	import Modal, { getModal } from './Modal.svelte';
	export let teamsPlayers, teamsPicked, isPassed, result;

	const dispatch = createEventDispatcher();

	function modifyPlayerPool() {
		dispatch('modifyPlayerPool');
	}

	function saveFixture() {
		dispatch('saveFixture');
	}

	function openRecordResultsModal() {
		getModal().open();
	}

	function recordResult(data) {
		dispatch('recordResult', data.detail);
	}
</script>

{#if teamsPicked}
	<div class="teams">
		<div class="teams__team">
			<div class="teams__label">Team A</div>
			<div class="teams__playerbox">
				<ul>
					{#each teamsPlayers as player}
						{#if player.team === 'a'}
							<li>{player.name} ({player.elo})</li>
						{/if}
					{/each}
				</ul>
			</div>
		</div>
		<div class="teams__team">
			<div class="teams__label">Team B</div>
			<div class="teams__playerbox">
				<ul>
					{#each teamsPlayers as player}
						{#if player.team === 'b'}
							<li>{player.name} ({player.elo})</li>
						{/if}
					{/each}
				</ul>
			</div>
		</div>
	</div>
	{#if !result}
		<div>
			<button on:click>Reshuffle teams</button>
			<button on:click={modifyPlayerPool}>Edit players</button>
			<button on:click={saveFixture}>Save fixture</button>
			{#if isPassed}
				<button on:click={openRecordResultsModal}>Record results</button
				>
				<Modal>
					<RecordResults on:recordResult={recordResult} />
				</Modal>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.teams {
		display: flex;
	}

	.teams__team {
		border: 1px solid #707070;
		flex-grow: 1;
		width: 50%;
	}

	.teams__label {
		font-size: 20px;
		font-weight: 800;
	}
</style>
