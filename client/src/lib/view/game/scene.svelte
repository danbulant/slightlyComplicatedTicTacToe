<script lang="ts">
    import { connection, gameData } from "$lib/Websocket";
    import { onMount } from "svelte";
    import { setCanvas, resize, stop } from "./init";

    var canvas: HTMLCanvasElement;

    onMount(() => {
        console.log("Started");
        setCanvas(canvas);
        return () => {
            console.log("Stopped");
            stop();
        }
    });

    function increaseScore() {
        $connection!.setScore($gameData!.score + 1);
    }
    function decreaseLives() {
        $connection!.setLives($gameData!.lives - 1);
    }
    function keydown(e: KeyboardEvent) {
        if(e.key === "KeyT") {
            increaseScore();
        }
    }
</script>

<svelte:window on:resize={resize} on:keydown={keydown}/>


<canvas bind:this={canvas} on:click={increaseScore} on:contextmenu={decreaseLives} />