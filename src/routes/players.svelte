<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit';
    import authStore from '../stores/authStore';

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

<div class="row">
    <h1>Players</h1>
</div>