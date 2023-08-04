<script lang="ts">
	import { fade, fly } from "svelte/transition";
	import { DEFAULT_TRANSITION_DURATION } from "./config";

    export var visible: boolean = false;

    const duration = DEFAULT_TRANSITION_DURATION;

    function keydown(e: KeyboardEvent) {
        if(e.key === "Escape") visible = false;
    }
</script>

{#if visible}
    <div class="backdrop" transition:fade={{ duration: duration / 2 }} on:click|self={() => visible = false} on:keydown={keydown}>
    </div>
    <div class="dialog" in:fly={{ duration: duration / 1.5, y: 15 }} out:fly={{ duration, y: -15 }}>
        <slot></slot>
    </div>
{/if}

<style lang="postcss">
    .backdrop {
        @apply fixed top-0 left-0 w-full h-full bg-black/50 z-50;
    }

    .dialog {
        @apply bg-white border-1 border-black/70 border-solid rounded-lg p-8
        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-h-80vh overflow-y-auto max-w-80vw;
    }
    :global(.dark) .dialog {
        @apply bg-black border-white/50;
    }
</style>