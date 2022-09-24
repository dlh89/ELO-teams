<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function recordResult(e: any) {
		const data = {
			winningTeam: e.target.dataset.team,
		};
		dispatch('recordResult', data);
	}
</script>

<p>Which team won?</p>
<button on:click={recordResult} data-team="a">Team A</button>
<button on:click={recordResult} data-team="b">Team B</button>
