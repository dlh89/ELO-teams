<script>
	export let name = '';
</script>

<div>
	<form on:submit|preventDefault>
		<label for="player js-add-player-btn">Add a player:</label>
		<input type="text" id="player" name="playerName" bind:value="{name}">
		<input type="submit" value="Add player">
	</form>
</div>

<style>
	/* h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	} */
</style>