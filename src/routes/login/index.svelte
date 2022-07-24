<script context="module" lang="ts">
    import authStore from '../../stores/authStore';

	authStore.subscribe(async ({ isLoggedIn }) => {
		if (isLoggedIn) {
			await goto('/dashboard');
		}
	});
</script>

<script lang="ts">
	import { app } from '../../config/firebase';
	import { getAuth } from 'firebase/auth';
	import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
	import { goto } from '$app/navigation';

	const auth = getAuth(app);

	async function handleSignIn() {
		// Google Auth with redirect
		const provider = new GoogleAuthProvider();
		await signInWithRedirect(auth, provider);
	}
</script>

<h1>Sign in</h1>
<button on:click="{handleSignIn}">Sign in with Google</button>