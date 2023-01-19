<script lang="ts">
    export var player: number;
    export var board: number | string;
    export var piece: number | string;
    export var latest: boolean = false;
</script>
<div class="move" class:latest>
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
    <span class="board">B<b>{board}</b></span>
    <span class="piece">#<b>{piece}</b></span>
</div>

<style>
    .move {
        @apply flex gap-2 p-1 items-center leading-none;
    }
    .latest {
        @apply opacity-35;
    }
    .player {
        @apply inline-block w-1em h-1em;
        margin-top: -0.225em;
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