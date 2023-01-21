<script lang="ts">
	import { createEventDispatcher, onMount, tick } from "svelte";
	import { quadOut } from "svelte/easing";
	import { draw, fade, fly } from "svelte/transition";
	import Move from "./move.svelte";

    export var self: 1 | 2 = 1;
    export var twoPlayer: boolean = false;
    export var selfName: string | null = null;
    export var opponentName: string | null = null;

    const dispatch = createEventDispatcher();

    var classes = [
        'top left',
        'top middle',
        'top right',
        'middle left',
        'middle-middle',
        'middle right',
        'bottom left',
        'bottom middle',
        'bottom right'
    ];

    var hoveredPiece: null | { i: number, j: number } = null;

    var highlightedContainer: null | number = null;

    $: highlightedContainer = hoveredPiece ? highlightContainerByPiece(hoveredPiece.j) : null;

    function highlightContainerByPiece(j: number) {
        if(!containerStates[j]) return j;
        return getCurrentContainer();
    }

    function backtrack() {
        for(let i = moves.length - 1; i >= 0; i--) {
            if(containerStates[moves[i].i] == 0) {
                return moves[i].i;
            }
        }
    }

    var currentContainer: number = 4;
    var currentPlayer: 1 | 2 = 1;

    var moves: { p: 1 | 2, i: number, j: number }[] = [];

    $: currentContainer = getCurrentContainer(moves);
    $: currentPlayer = moves[moves.length - 1]?.p == 1 ? 2 : 1;

    function getCurrentContainer(_moves?: any) {
        if(overallState) return -1;
        let last = moves[moves.length - 1]?.j;
        if(last == null || last == undefined) return 4;
        
        if(containerStates[last] == 0) return last;
        return backtrack() ?? -1;
    }

    let containerStates = new Array(9).fill(0);
    let overallState = 0;

    function addMove(i: number, j: number) {
        if(moves.find(move => move.i == i && move.j == j))
            return;
        if(currentContainer !== i) return;
        if(twoPlayer && currentPlayer !== self) return;
        if(overallState) return;
        moves.push({ p: currentPlayer, i, j });
        moves = moves;

        dispatch("move", { i, j, p: currentPlayer });

        updateContainerStates();
    }

    function addPlayerMove(player: 1 | 2, i: number, j: number) {
        if(moves.find(move => move.i == i && move.j == j)) {
            console.error("DESYNC! Repeated move", player, i, j);
            return;
        }
        if(currentContainer !== i) {
            console.error("DESYNC! Invalid move (container not active)!", player, i, j, "current container:", i);
            return;
        }

        moves.push({ p: player, i, j });
        moves = moves;

        updateContainerStates();
    }

    export { addPlayerMove };

    function updateContainerStates() {
        for(var i in containerStates) {
            if(containerStates[i]) continue;
            var containerMoves = moves.filter(move => move.i === Number(i));
            var state: number[][] = new Array(3).fill(0).map(t => new Array(3).fill(0));
            for(var move of containerMoves) {
                state[Math.floor(move.j / 3)][move.j % 3] = move.p;
            }

            var winner = 0;
            for(let num = 0; num < 3; num++) {
                if(state[num][0] == state[num][1] && state[num][1] == state[num][2] && state[num][0] != 0) {
                    winner = state[num][0];
                }
                if(state[0][num] == state[1][num] && state[1][num] == state[2][num] && state[0][num] != 0) {
                    winner = state[0][num];
                }
            }
            if(state[0][0] == state[1][1] && state[1][1] == state[2][2] && state[0][0] != 0) {
                winner = state[0][0];
            }
            if(state[0][2] == state[1][1] && state[1][1] == state[2][0] && state[0][2] != 0) {
                winner = state[0][2];
            }
            if(!winner && containerMoves.length == 9) {
                winner = 3;
            }
            
            containerStates[i] = winner;
        }

        overallState = 0;

        if(containerStates[0] == containerStates[1] && containerStates[1] == containerStates[2] && containerStates[0] != 0) {
            overallState = containerStates[0];
        }
        if(containerStates[3] == containerStates[4] && containerStates[4] == containerStates[5] && containerStates[3] != 0) {
            overallState = containerStates[3];
        }
        if(containerStates[6] == containerStates[7] && containerStates[7] == containerStates[8] && containerStates[6] != 0) {
            overallState = containerStates[6];
        }
        if(containerStates[0] == containerStates[3] && containerStates[3] == containerStates[6] && containerStates[0] != 0) {
            overallState = containerStates[0];
        }
        if(containerStates[1] == containerStates[4] && containerStates[4] == containerStates[7] && containerStates[1] != 0) {
            overallState = containerStates[1];
        }
        if(containerStates[2] == containerStates[5] && containerStates[5] == containerStates[8] && containerStates[2] != 0) {
            overallState = containerStates[2];
        }
        if(containerStates[0] == containerStates[4] && containerStates[4] == containerStates[8] && containerStates[0] != 0) {
            overallState = containerStates[0];
        }
        if(containerStates[2] == containerStates[4] && containerStates[4] == containerStates[6] && containerStates[2] != 0) {
            overallState = containerStates[2];
        }
        if(containerStates.every(state => state != 0)) {
            overallState = 3;
        }
    }

    function reset() {
        moves = [];
        containerStates = new Array(9).fill(0);
    }

    function check(e: MouseEvent) {
        if(!moves.length) return;
        var confirmed = confirm("Are you sure you want to quit?");
        if(!confirmed) return e.preventDefault() || false;
    }

    async function randomMoves() {
        let last = currentContainer;
        for(let i = 0; i < 40; i++) {
            addMove(last, Math.floor(Math.random() * 9));
            await tick();
            last = moves[moves.length - 1].j;
        }
    }

    // randomMoves();

    var movesShown = false;

    const duration = 400;
    var moveDelayMultiplier = 2;

    onMount(() => {
        let i = setTimeout(() => {
            moveDelayMultiplier = 0;
        }, duration * moveDelayMultiplier);

        return () => clearTimeout(i);
    });

    let innerWidth = window.innerWidth;
</script>

<svelte:window bind:innerWidth />

<a transition:fly={{ duration, delay: duration * 0.5, x: -60, opacity: 0 }} href="/" on:click={check} class="text-black dark:text-white arrow-back fixed top-0 left-0 w-4 h-4 m-4 p-2 transform transition-transform hover:-translate-x-1">
    <svg width="16" height="16">
        <line y1="50%" x1="0" y2="50%" x2="100%" stroke="currentColor" stroke-width="2" />
        <line y1="50%" x1="0" y2="100%" x2="50%" stroke="currentColor" stroke-width="2" />
        <line y1="50%" x1="0" y2="0" x2="50%" stroke="currentColor" stroke-width="2" />
    </svg>
</a>

{#if !twoPlayer}
    <!-- I have no idea why x is inverted here -->
    <div transition:fly={{ duration, delay: duration, x: 120, opacity: 0 }} on:click={reset} on:keydown={reset} class="reload fixed top-0 left-10 w-4 h-4 m-4 p-2 transform transition-transform rotate-180 hover:rotate-360 active:rotate-540">
        <svg fill="currentColor" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 489.645 489.645" xml:space="preserve" class="w-full h-full">
            <g>
                <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3
                    c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5
                    c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8
                    c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2
                    C414.856,432.511,548.256,314.811,460.656,132.911z"/>
            </g>
        </svg>
    </div>
{/if}

{#if innerWidth < 1024}
    <div transition:fly={{ duration, delay: 0, x: 60, opacity: 0 }} class="fixed top-0 right-0 w-4 h-4 m-4 p-2 menu cursor-pointer" on:click={() => movesShown = !movesShown} on:keydown={() => movesShown = !movesShown}>
        <svg width=16 height=16>
            <line y1="2" y2="2" x1="0" x2="100%" stroke="currentColor" stroke-width="2" />
            <line y1="8" y2="8" x1="0" x2="100%" stroke="currentColor" stroke-width="2" />
            <line y1="14" y2="14" x1="0" x2="100%" stroke="currentColor" stroke-width="2" />

            <line y1="2" y2="2" x1="300%" x2="400%" stroke="currentColor" stroke-width="2" />
            <line y1="8" y2="8" x1="300%" x2="400%" stroke="currentColor" stroke-width="2" />
            <line y1="14" y2="14" x1="300%" x2="400%" stroke="currentColor" stroke-width="2" />
        </svg>
    </div>
{/if}

<main class:disabled={overallState} class="flex flex-wrap min-h-100vh min-w-full items-center">
    <div class="board relative p-8">
        {#each classes as className, i}
            <div
                transition:fade={{ duration, delay: duration * 0.3 * (i + 1) }}
                class:hover={hoveredPiece?.i == i}
                class:disabled={containerStates[i]}
                class:current={currentContainer === i}
                class:highlighted={highlightedContainer === i}
                class="squares-container {className}">
                {#each (new Array(9)) as _, j}
                    {@const moveIndex = moves.findIndex(cmove => cmove.i == i && cmove.j == j)}
                    {@const move = moves[moveIndex]}
                    <div
                        class:latest={moveIndex == moves.length - 1 && !hoveredPiece}
                        on:click={() => addMove(i, j)}
                        on:keydown={() => addMove(i, j)}
                        class:hover={hoveredPiece?.i == i && hoveredPiece.j == j}
                        class="square"
                        class:move
                        class:preview={!move}
                        class:cross={move && move.p==1}
                        class:circle={move && move.p==2}
                        on:mouseover={() => { if(currentContainer == i) hoveredPiece = { i, j } }}
                        on:focus={() => { if(currentContainer == i) hoveredPiece = { i, j }}}
                        on:mouseleave={() => { if(hoveredPiece?.i == i && hoveredPiece.j == j) hoveredPiece = null; }}
                        >

                        {#if move}
                            {#if move.p == 1}
                                <svg width="16" height="16">
                                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                                </svg>
                            {:else}
                                <svg width="16" height="16">
                                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                                </svg>
                            {/if}
                        {:else}
                            {#if currentPlayer == 1}
                                <svg width="16" height="16">
                                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                                </svg>
                            {:else}
                                <svg width="16" height="16">
                                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                                </svg>
                            {/if}
                        {/if}
                    </div>
                {/each}

                {#if containerStates[i] == 1}
                    <div class="winner winner-1">
                        <svg width="16" height="16">
                            <line transition:draw={{ duration: 500, easing: quadOut }} x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                            <line transition:draw={{ delay: 500, duration: 500, easing: quadOut }} x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </div>
                {:else if containerStates[i] == 2}
                    <div class="winner winner-2">
                        <svg width="16" height="16">
                            <circle transition:draw={{ duration: 500, easing: quadOut }} cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                        </svg>
                    </div>
                {:else if containerStates[i] == 3}
                    <div class="winner winner-3">
                        <svg width="16" height="16">
                            <line transition:draw={{ duration: 500, easing: quadOut }} x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                            <line transition:draw={{ delay: 1000, duration: 500, easing: quadOut }} x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                            <circle transition:draw={{ delay: 500, duration: 500, easing: quadOut }} cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                        </svg>
                    </div>
                {/if}
            </div>
        {/each}

        {#if overallState == 1}
            <div class="winner winner-1">
                <svg width="16" height="16">
                    <line transition:draw={{ duration: 500, easing: quadOut }} x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                    <line transition:draw={{ delay: 500, duration: 500, easing: quadOut }} x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                </svg>
            </div>
        {:else if overallState == 2}
            <div class="winner winner-2">
                <svg width="16" height="16">
                    <circle transition:draw={{ duration: 500, easing: quadOut }} cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                </svg>
            </div>
        {:else if overallState == 3}
            <div class="winner winner-3">
                <svg width="16" height="16">
                    <line transition:draw={{ duration: 500, easing: quadOut }} x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                    <line transition:draw={{ delay: 1000, duration: 500, easing: quadOut }} x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                    <circle transition:draw={{ delay: 500, duration: 500, easing: quadOut }} cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                </svg>
            </div>
        {/if}

        {#key currentPlayer}
            <div class="absolute top-200 left-0 right-0 text-center flex items-center justify-center gap-2" in:fly={{ delay: 300 + 300 * moveDelayMultiplier * 1.5, duration: 300, easing: quadOut, opacity: 0, y: 30 }} out:fly={{ delay: 0, duration: 300, easing: quadOut, opacity: 0, y: -30 }}>
                {#if overallState == 1 || !overallState && currentPlayer == 1}
                    <svg width="16" height="16" class="mb-0.5 text-red-500">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                    </svg>
                {:else if overallState == 2 || !overallState && currentPlayer == 2}
                    <svg width="16" height="16" class="mb-0.5 text-blue-500">
                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                    </svg>
                {:else}
                    <svg width="16" height="16" class="mb-0.5">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                    </svg>
                {/if}
                {#if overallState}
                    {#if overallState == 1}
                        <b class="text-red-500">{(self == 1 ? selfName : opponentName) || "cross"}</b> won
                    {:else if overallState == 2}
                        <b class="text-blue-500">{(self == 2 ? selfName : opponentName) || "circle"}</b> won
                    {:else if overallState == 3}
                        draw
                    {/if}
                {:else}
                    is on turn.
                    {#if twoPlayer && self == currentPlayer}
                        <span class="-ml-1"><b>It is <span class:text-red-500={currentPlayer == 1} class:text-blue-500={currentPlayer == 2}>YOUR</span> {selfName ? "(" + selfName + ")" : ""} turn.</b></span>
                    {:else if twoPlayer && self != currentPlayer}
                        <span class="-ml-1">Waiting for <b class:text-red-500={currentPlayer == 1} class:text-blue-500={currentPlayer == 2}>{opponentName || "opponent"}</b>&hellip;</span>
                    {/if}
                {/if}
            </div>
        {/key}
    </div>

    
    {#if movesShown || innerWidth >= 1024}
        <div transition:fade={{ duration }} class="lg:hidden bg-black/40 fixed inset-0 z-10" on:click={() => movesShown = false} on:keydown={() => movesShown = false} />

        <div transition:fly={{ delay: duration * moveDelayMultiplier, duration, x: 160, opacity: 0 }} class="info z-11 min-w-38 px-4 flex-grow-0 flex-shrink overflow-y-auto lt-lg:(absolute top-0 right-0 h-full bg-black)">
            <div class="moves">
                <div class="move">
                    Moves
                    {#key moves.length}
                        <span in:fly={{ delay: 300, duration: 300, easing: quadOut, opacity: 0, y: 16 }} out:fly={{ delay: 0, duration: 300, easing: quadOut, opacity: 0, y: -16 }} class="rounded p-1 -ml-1 bg-gray-300 dark:bg-gray-800">{moves.length}</span>
                    {/key}
                </div>
                {#if twoPlayer}
                    <div class="move text-red-500">
                        <svg width="16" height="16">
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                            <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
                        </svg>
                        {self == 1 ? (selfName || "you") : (opponentName || "opponent")}
                    </div>
                    <div class="move text-blue-500">
                        <svg width="16" height="16">
                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
                        </svg>
                        {self == 2 ? (selfName || "you") : (opponentName || "opponent")}
                    </div>
                {/if}
                {#each moves as move}
                    <Move player={move.p} board={move.i} piece={move.j} on:mouseover={() => hoveredPiece = { i: move.i, j: move.j }} on:mouseout={() => { if(hoveredPiece?.j == move.j && hoveredPiece.i == move.i) hoveredPiece = null }} />
                {/each}
                <Move latest player={currentPlayer} board={hoveredPiece?.i ?? "?"} piece={hoveredPiece?.j ?? "?"} />
            </div>
        </div>
    {/if}
</main>



<style>
    .info .moves {
        @apply p-4 font-mono flex flex-col flex-wrap max-w-185 m-auto;
    }
    .move {
        @apply p-1 flex gap-2 p-1 items-center leading-none;
    }
    .winner {
        @apply absolute inset-4 pointer-events-none;
    }
    .winner svg {
        @apply w-full h-full;
    }
    .winner-2 {
        @apply text-blue-500;
    }
    .winner-1 {
        @apply text-red-500;
    }
    .board {
        @apply grid grid-cols-3 grid-rows-3 gap-10 w-max h-max m-auto my-5 flex-shrink-0;
    }
    .squares-container {
        @apply grid grid-cols-3 grid-rows-3 gap-5 w-max h-max opacity-35 relative;
    }

    .square {
        @apply border-black border-solid border w-6 h-6 p-4 cursor-pointer flex items-center justify-center transition-none;
        aspect-ratio: 1 / 1;
    }
    :global(.dark) .square {
        @apply border-white;
    }
    .squares-container:not(.current) .square:active {
        @apply bg-red-600/10;
    }
    .squares-container.hover {
        @apply opacity-100;
    }
    .square.preview svg {
        @apply hidden opacity-20;
    }
    .square.preview:hover svg {
        @apply block;
    }
    .square.move, .disabled .square {
        @apply cursor-not-allowed;
    }
    .square svg {
        @apply w-full h-full transition-none;
    }
    .square svg * {
        @apply transition-none;
    }
    .square:hover, .square.hover {
        @apply bg-black/5;
    }
    .square.hover.cross, .square:hover.cross, .square.latest.cross {
        @apply text-red-500;
    }
    .square.hover.circle, .square:hover.circle, .square.latest.circle {
        @apply text-blue-500;
    }
    .highlighted {
        @apply opacity-75;
    }
    .current {
        @apply opacity-100;
    }
    .highlighted.current {
        @apply bg-yellow-600/5;
    }

    .top.left, .middle-middle, .bottom.middle, .bottom.right, .middle.right, .top.left .square:first-child, .middle-middle .square:first-child, .bottom.middle .square:first-child, .bottom.right .square:first-child, .middle.right .square:first-child {
        @apply rounded-tl-2xl;
    }
    .top.right, .middle-middle, .bottom.left, .middle.left, .bottom.middle, .top.right .square:nth-child(3), .middle-middle .square:nth-child(3), .bottom.left .square:nth-child(3), .middle.left .square:nth-child(3), .bottom.middle .square:nth-child(3) {
        @apply rounded-tr-2xl;
    }
    .top.right, .top.middle, .middle-middle, .bottom.left, .middle.right, .top.right .square:nth-child(7), .top.middle .square:nth-child(7), .middle-middle .square:nth-child(7), .bottom.left .square:nth-child(7), .middle.right .square:nth-child(7) {
        @apply rounded-bl-2xl;
    }
    .top.left, .top.middle, .middle-middle, .bottom.right, .middle.left, .top.left .square:last-child, .top.middle .square:last-child, .middle-middle .square:last-child, .bottom.right .square:last-child, .middle.left .square:last-child {
        @apply rounded-br-2xl;
    }

    .menu svg line {
        transition: transform 300ms ease-in-out;
    }

    .menu svg line:nth-child(1) {
        transition-delay: 0ms;
    }
    .menu svg line:nth-child(2) {
        transition-delay: 50ms;
    }
    .menu svg line:nth-child(3) {
        transition-delay: 150ms;
    }
    .menu svg line:nth-child(4) {
        transition-delay: 0ms;
    }
    .menu svg line:nth-child(5) {
        transition-delay: 50ms;
    }
    .menu svg line:nth-child(6) {
        transition-delay: 150ms;
    }

    .menu:hover svg line {
        transform: translateX(-300%);
    }
</style>