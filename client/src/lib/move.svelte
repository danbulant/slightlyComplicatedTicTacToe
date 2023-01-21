<script lang="ts">
    export var player: number;
    export var board: number | "?";
    export var piece: number | "?";
    export var latest: boolean = false;
</script>

<div class="move select-none" class:latest on:mouseover on:mouseout on:focus on:blur>
    <span class="player player-{player}">
        {#if player == 1}
            <svg width="16" height="16">
                <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="2" />
                <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="2" />
            </svg>
        {:else}
            <svg width="16" height="16">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
        {/if}
    </span>
    <span class="board flex items-center">B{board == "?" ? "?" : board + 1}<svg width="16" height="16">
        <line x1="33%" y1="0" x2="33%" y2="100%" stroke="currentColor" stroke-width="2" />
        <line x1="66%" y1="0" x2="66%" y2="100%" stroke="currentColor" stroke-width="2" />
        <line x1="0" y1="33%" x2="100%" y2="33%" stroke="currentColor" stroke-width="2" />
        <line x1="0" y1="66%" x2="100%" y2="66%" stroke="currentColor" stroke-width="2" />

        {#if board !== "?"}
            <rect y="{[0,33,66][Math.floor(board / 3)]}%" x="{[0,33,66][(board % 3)]}%" width="33%" height="33%" fill="currentColor" stroke="none" />
        {/if}
    </svg></span>
    <span class="piece flex items-center">#{piece == "?" ? "?" : piece + 1}<svg width="16" height="16">
        <line x1="33%" y1="0" x2="33%" y2="100%" stroke="currentColor" stroke-width="2" />
        <line x1="66%" y1="0" x2="66%" y2="100%" stroke="currentColor" stroke-width="2" />
        <line x1="0" y1="33%" x2="100%" y2="33%" stroke="currentColor" stroke-width="2" />
        <line x1="0" y1="66%" x2="100%" y2="66%" stroke="currentColor" stroke-width="2" />

        {#if piece !== "?"}
            <rect y="{[0,33,66][Math.floor(piece / 3)]}%" x="{[0,33,66][(piece % 3)]}%" width="33%" height="33%" fill="currentColor" stroke="none" />
        {/if}
    </svg></span>
</div>

<style>
    .move {
        @apply flex gap-2 p-1 items-center leading-none;
    }
    .latest {
        @apply opacity-35;
    }
    :global(.dark) .latest {
        @apply opacity-50;
    }
    .player {
        @apply inline-block w-1em h-1em;
    }
    svg {
        margin-top: -0.175em;
    }
    .player svg {
        @apply w-full h-full;
    }
    .player-1 {
        @apply text-red-500;
    }
    .player-2 {
        @apply text-blue-500;
    }
</style>