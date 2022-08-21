<script lang="ts">
	import { app } from '../config/firebase';
	import authStore from '../stores/authStore';
	import { getAuth } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const auth = getAuth(app);

	onMount(() => {
		auth.onAuthStateChanged((user) => {
			console.log('user:');
			console.log(user);
			if (user) {
				authStore.set({
					isLoggedIn: user ? true : false,
					user,
				});
			} else {
				authStore.set({
					isLoggedIn: false,
					user: null,
				});
				goto('/login');
			}
		});
	});

	async function handleLogout() {
		auth.signOut();
		goto('/login');
	}
</script>

<nav>
	<div class="row">
		<ul>
			{#if !$authStore.isLoggedIn}
				<li><a href="/">Home</a></li>
				<li><a href="/login">Login</a></li>
			{:else}
				<li><a href="/dashboard">Dashboard</a></li>
				<li><a href="/fixture">Create fixture</a></li>
				<li><a href="/players">Edit players</a></li>
			{/if}
		</ul>
		{#if $authStore.isLoggedIn}
			<button on:click={handleLogout}>Logout</button>
		{/if}
	</div>
</nav>
<slot />

<style>
	:global(.row) {
		max-width: 920px;
		margin: 0 auto;
	}

	:global(.heading-2) {
		font-size: 24px;
		font-weight: 800;
		margin-bottom: 18px;
	}
</style>
