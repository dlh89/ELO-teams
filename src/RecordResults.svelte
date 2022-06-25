<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

    function recordResults(e) {
        const data = {
            winningTeam: e.target.dataset.team,
        }
        dispatch('recordResults', data);
    }
</script>

<p>Which team won?</p>
<button on:click={recordResults} data-team="a">Team A</button>
<button on:click={recordResults} data-team="b">Team B</button>