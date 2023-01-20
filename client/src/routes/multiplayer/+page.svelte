<script lang="ts">
    import Game from "$lib/game.svelte";
    import List from "$lib/list.svelte";
    import NameChoose from "$lib/nameChoose.svelte";
	import Wait from "$lib/wait.svelte";
    import { connection, MoveEvent, room } from "$lib/websocket";
	import { onMount } from "svelte";

    var addPlayerMove: (p: number, i: number, j: number) => void;

    function addSelfMove(e: any) {
        $connection?.broadcast({
            t: "move",
            i: e.detail.i,
            j: e.detail.j
        });
    }

    onMount(() => {
        return () => {
            $connection?.leave();
        }
    });

    let addedEventListener = false;
    $: {
        if($connection && !addedEventListener) {
            function addOtherMove(event: MoveEvent) {
                console.log("Received other move", event.i, event.j);
                // note the changed order between this and self - we need to set the opponent here!
                addPlayerMove($room?.host === $connection?.name ? 2 : 1, event.i, event.j);
            }
            console.log("Adding event listener");
            $connection.addEventListener("move", addOtherMove as any);
            addedEventListener = true;
        } else if(!$connection && addedEventListener) {
            addedEventListener = false;
        }
    }
</script>

<svelte:head>
    <title>Slightly complicated tictactoe</title>
</svelte:head>

{#if !$connection}
    <NameChoose />
{:else if !$room}
    <List />
{:else if $room.count < 2}
    <Wait />
{:else}
    <Game
        twoPlayer
        self={$room.host === $connection.name ? 1 : 2}
        opponentName={$connection.name}
        selfName={[...$connection.players.values()].find(t => t !== $connection?.name)}
        on:move={addSelfMove}
        bind:addPlayerMove
        />
{/if}