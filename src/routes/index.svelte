<script>
    import { app } from "../config/firebase";
    import { getAuth } from "firebase/auth";
    import { signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const auth = getAuth(app);

    async function handleSignIn() {
        // Google Auth with redirect
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    }

    onMount(async () => {
        // TODO check if already logged in

		const result = await getRedirectResult(auth);
        if (result) {
            // This is the signed-in user
            console.log('result:', result);
            const user = result.user;
            goto('/dashboard');
        }
	});
</script>

<h1>Sign in</h1>
<button on:click="{handleSignIn}">Sign in with Google</button>