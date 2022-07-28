<script lang="ts">
    import { connection, gameData, players } from "$lib/Websocket";
    import { flip } from "svelte/animate";

    let scoreboard: { name: string, score: number, lives: number, lastScoreChange: number }[] = [];
    $: {
        scoreboard = [...$players.values(), { name: $connection!.name, score: $gameData!.score, lives: $gameData!.lives, lastScoreChange: $gameData!.lastScoreChange }].sort((a, b) => (b.score - a.score) || (b.lives - a.lives) || (a.lastScoreChange - b.lastScoreChange) || a.name.localeCompare(b.name));
    }
</script>

<div class="container">
    <div class="left">
        <div class="hearts">
            {#each [...Array($gameData?.lives).keys()] as i}
                <img src="/assets/heart.png" alt="">
            {/each}
        </div>
        <ul>
            {#each scoreboard as player (player.name)}
                <li animate:flip class:dead-player={!player.lives}>
                    {player.name}
                    <span class="score">{player.score}</span>
                    {#if !player.lives}
                        <div class="dead">DEAD</div>
                    {/if}
                </li>
            {/each}
        </ul>
    </div>
    <main>
        <slot />
    </main>
    <div class="right">

    </div>
</div>

<style>
    .hearts img {
        width: 20px;
        height: 20px;
        margin: 0 5px;
    }
    .hearts {
        height: 30px;
    }
    .container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 100vh;
        width: 100vw;
        background-color: #85e65c;
    }
    main {
        max-width: calc(100vw - 310px);
        border-left: 10px solid #bd5ce6;
    }
    .left {
        flex-grow: 1;
        width: 300px;
        height: calc(100% - 10px);
        margin: 5px;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        border-bottom: 1px solid #ccc;
    }
    li:last-child {
        border-bottom: none;
    }
    li.dead-player {
        color: #ccc;
    }
    .dead {
        font-weight: bold;
        font-size: 1.2rem;
        margin-left: 1rem;
    }
    .score {
        font-size: 1.5em;
        font-weight: bold;
        background-color: #bd5ce6;
        color: #85e65c;
    }
</style>