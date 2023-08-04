<script lang="ts">
	import Dialog from "./Dialog.svelte";
	import BackButton from "./backButton.svelte";
	import Game from "./game.svelte";

    export var visible: boolean = false;

    let vsm = typeof window !== "undefined" ? Math.min(window.innerWidth, window.innerHeight) / 2.3 : 256;

    function backClicked(e: MouseEvent) {
        e.preventDefault();
        visible = false;
    }
</script>

<Dialog bind:visible>
    <div class="absolute top-0 left-0">
        <BackButton href="/" on:click={backClicked} />
    </div>
    <h1>Rules</h1>
    <p>How do I play the game?</p>
    <h2>You choose where your opponent will play</h2>
    <p>The board is divided into sub-boards, and you can always only play in one of them. Based on where you place your
        piece, the opponent will have to play in the corresponding sub-board.
    </p>
    <p class="desktop-only">On desktop, you can move your mouse over the field to see where the opponent "will be sent".</p>

    <div class="flex" style:--vsm="{vsm*1.15}px">
        <div class="game-container" >
            <Game readonly showMoveList={false} autoCalculateState={false} innerWidthOverride={vsm} innerHeightOverride={vsm} />
        </div>
        <div class="game-container">
            <Game readonly showMoveList={false} autoCalculateState={false} innerWidthOverride={vsm} innerHeightOverride={vsm}
                moves={[{ p: 1, i: 4, j: 8 }]}
                />
        </div>
    </div>
    <p>When you can't play in the target board, you'll stay in the current board. If you can't stay, you'll play in the board the previous move was made in.
        You can see move list on the right to see where you might get sent. Mouse preview shows this correctly.
    </p>
    <h2>Three in a row to win a board</h2>
    <p>Get 3 in a row/column/diagonally in a sub-board to with that sub-board. A larger symbol will be drawn.</p>

    <div class="flex" style:--vsm="{vsm*1.15}px">
        <div class="game-container" >
            <Game readonly showMoveList={false} autoCalculateState={false} innerWidthOverride={vsm} innerHeightOverride={vsm}
                moves={[{ p: 1, i: 4, j: 6}, { p: 1, i: 4, j: 4}]}
                />
        </div>
        <div class="game-container">
            <Game readonly showMoveList={false} autoCalculateState={false} innerWidthOverride={vsm} innerHeightOverride={vsm}
                moves={[{ p: 1, i: 4, j: 6}, { p: 1, i: 4, j: 4}]}
                containerStates={[0,0,0,0,1,0,0,0,0]}
                defaultHighlightedContainer={4}
                />
        </div>
    </div>
    <h2>Three boards in a row to win the game</h2>
    <p>Get 3 sub-boards in a row/column/diagonally to win the overall game.</p>

    <div class="flex" style:--vsm="{vsm*1.15}px">
        <div class="game-container" >
            <Game readonly showMoveList={false} autoCalculateState={false} innerWidthOverride={vsm} innerHeightOverride={vsm}
                moves={[{ p: 1, i: 2, j: 6}, { p: 1, i: 2, j: 4}, { p: 1, i: 2, j: 2}]}
                containerStates={[0,0,0,0,1,0,1,0,0]}
                />
        </div>
        <div class="game-container">
            <Game readonly showMoveList={false} autoCalculateState={false} innerWidthOverride={vsm} innerHeightOverride={vsm}
                moves={[]}
                containerStates={[0,0,1,0,1,0,1,0,0]}
                overallState={1}
                defaultHighlightedContainer={4}
                />
        </div>
    </div>
</Dialog>

<style lang="postcss">
    .flex {
        @apply flex -mx-5 gap-2;
    }
    .desktop-only {
        display: none;
    }
    @media (pointer: fine) {
        .desktop-only {
            display: block;
        }
    }
    .game-container {
        width: var(--vsm);
        height: var(--vsm);
        overflow: hidden;
    }
</style>