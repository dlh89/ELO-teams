<script lang="ts">
    import { session } from '$app/stores'

    console.log($session.user);
</script>

<nav>
    <ul>
        {#if !$session.user}
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
        {:else}
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/fixture">Create fixture</a></li>
            <li><a href="/players">Edit players</a></li>
        {/if}
    </ul>
</nav>
<slot></slot>