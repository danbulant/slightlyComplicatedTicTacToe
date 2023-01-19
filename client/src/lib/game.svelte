<script lang="ts">
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

    var containers: HTMLDivElement[] = new Array(9);

    var hoveredPiece: null | { i: number, j: number } = null;

    var highlightedContainer: null | number = null;

    $: highlightedContainer = hoveredPiece?.j ?? null;

    var currentContainer: number = 4;

    var moves = [
        { p: 1, i: 4, j: 1 },
        { p: 2, i: 1, j: 2 },
        { p: 1, i: 2, j: 4 }
    ];
</script>

<main class="flex">
    <div class="board">
        {#each classes as className, i}
            <div bind:this={containers[i]} class:current={currentContainer === i} class:highlighted={highlightedContainer === i} class="squares-container {className}">
                {#each (new Array(9)) as _, j}
                    <div class="square" on:click={() => console.log(i, j)} on:mouseover={() => hoveredPiece = { i, j }} on:mouseleave={() => { if(hoveredPiece?.i == i && hoveredPiece.j == j) hoveredPiece = null; }}>
                        {#if moves.find(move => move.i == i && move.j == j)}
                            {#if moves.find(move => move.i == i && move.j == j)?.p == 1}
                                <svg width="16" height="16">
                                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="2" />
                                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="black" stroke-width="2" />
                                </svg>
                            {:else}
                                <svg width="16" height="16">
                                    <circle cx="50%" cy="50%" r="7" stroke="black" stroke-width="2" fill="none" />
                                </svg>
                            {/if}
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>

    <div class="moves">
        {#each moves as move}
            <div class="move">{move.p == 1 ? "X" : "O"} B{move.i} #{move.j}</div>
        {/each}
    </div>
</main>

<div class="chat">
    
</div>


<style>
    .moves {
        @apply p-4 font-mono;
    }
    .board {
        @apply grid grid-cols-3 grid-rows-3 gap-10 w-max h-max m-auto my-5;
    }
    .squares-container {
        @apply grid grid-cols-3 grid-rows-3 gap-5 w-max h-max;
    }

    .square {
        @apply border-black border-solid border w-6 h-6 p-4 cursor-pointer flex items-center justify-center;
    }
    .square svg {
        @apply w-full h-full;
    }
    .square:hover {
        @apply bg-black/20;
    }

    .highlighted {
        @apply bg-red-700/20;
    }
    .current {
        @apply bg-green-700/20;
    }
    .highlighted.current {
        @apply bg-black/20;
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
</style>