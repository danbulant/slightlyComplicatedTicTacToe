<script>
    import Game from "$lib/game.svelte";
    import List from "$lib/list.svelte";
    import NameChoose from "$lib/nameChoose.svelte";
    import { connection, room } from "$lib/websocket";
</script>

{#if !$connection}
    <NameChoose />
{:else if !$room}
    <List />
{:else}
    <Game />
{/if}