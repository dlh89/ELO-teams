<script context="module" lang="ts">
	import authStore from '../stores/authStore';
</script>

<div class="row">
	<h1>Dashboard</h1>
	{#if $authStore.user}
		<p>Welcome, {$authStore.user.displayName}</p>
	{/if}
</div>
