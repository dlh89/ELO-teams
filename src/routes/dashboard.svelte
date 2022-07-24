<script context="module" lang="ts">
    import authStore from '../stores/authStore';
    import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ props }) => {
        let shouldRedirect = false;
        authStore.subscribe(async ({ isLoggedIn }) => {
            if (!isLoggedIn) {
                shouldRedirect = true;
            }
        });

        if (shouldRedirect) {
            return {
                status: 302,
                redirect: '/login',
            }
        }

		return { props }
	}
</script>

<h1>Dashboard</h1>
{#if $authStore.user}
    <p>Welcome, {$authStore.user.displayName}</p>
{/if}