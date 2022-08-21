<script>
	import { database } from '../../config/firebase.js';
	import { ref, update, remove } from 'firebase/database';
	import { goto } from '$app/navigation';

	export let player, id;
	let notice = '';

	function handleSubmit(e) {
		const formData = new FormData(e.target);

		// TODO success message/redirect?
		update(ref(database, `players/${id}`), {
			name: formData.get('name'),
		});
		notice = 'Player updated.';
	}

	function handleDelete() {
		const isConfirmed = window.confirm(
			'Are you sure you want to permanently delete this player?'
		);
		if (isConfirmed) {
			// TODO success message/redirect?
			remove(ref(database, `players/${id}`));
			goto('/players?notice=player-delete');
		}
	}
</script>

<div class="row">
	{#if notice}
		<div class="notice">{notice}</div>
	{/if}
	<h1>Edit player</h1>
	<form on:submit|preventDefault={handleSubmit}>
		<div>
			<label for="name">Name</label>
			<input type="text" name="name" id="name" value={player.name} />
		</div>
		<div>
			<label for="elo">Elo rating</label>
			<input type="text" disabled value={player.elo} />
		</div>
		<input type="submit" value="Save" />
	</form>
	<button on:click={handleDelete}>Delete player</button>
</div>
