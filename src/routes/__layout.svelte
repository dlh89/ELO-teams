<script lang="ts">
	import { app } from '../config/firebase';
    import authStore from '../stores/authStore';
	import { getAuth } from "firebase/auth";
	import { goto } from '$app/navigation';

	const auth = getAuth(app);
    auth.onAuthStateChanged(user => {
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
        }
    })

    async function handleLogout() {
        auth.signOut();
        goto('/login');
    }
</script>

<nav>
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
        <button on:click="{handleLogout}">Logout</button>
    {/if}
</nav>
<slot></slot>