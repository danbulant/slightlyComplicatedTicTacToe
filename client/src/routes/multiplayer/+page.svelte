<script>
    import Game from "$lib/view/game/game.svelte";
    import List from "$lib/view/menu/list.svelte";
    import NameChoose from "$lib/view/menu/nameChoose.svelte";
    import { connection, room } from "$lib/Websocket";
</script>

{#if !$connection}
    <NameChoose />
{:else if !$room}
    <List />
{:else}
    <Game />
{/if}