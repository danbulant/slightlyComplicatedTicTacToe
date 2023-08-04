<script lang="ts">
	import PageTransition from "$lib/pageTransition.svelte";
	import { themeStore } from "$lib/themeStore";
    import "uno.css";

    import type { load } from "./+layout";
    export let data: Awaited<ReturnType<typeof load>>;

    $: if(typeof window !== "undefined") {
        if($themeStore == "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }

    var el: HTMLDivElement
    function clicked() {
        if(innerWidth < 768 || innerHeight < 768) {
            el.requestFullscreen({
                navigationUI: "hide"
            });
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="overflow-hidden w-100vw h-100vh dark:bg-black dark:text-white" on:click={clicked} bind:this={el}>
    <PageTransition url={data.url}>
        <slot />
    </PageTransition>
</div>

<style lang="postcss">
    :global(:root), :global(body) {
        @apply overflow-hidden w-100vw;
    }
    :global(*) {
        @apply transition-colors;
        -webkit-tap-highlight-color: transparent;
    }
    :global(::-webkit-scrollbar) {
        width: 10px;
    }
    :global(::-webkit-scrollbar-thumb) {
        background: #d8d8d8;
        border-radius: 5px;
    }
    :global(.dark ::-webkit-scrollbar-thumb) {
        background: #2e2e2e;
    }
    :global(::-webkit-scrollbar-track) {
        background: transparent;
    }
    :global(::-webkit-scrollbar-button) {
        display: none;
    }
    :global(::-webkit-scrollbar-track-piece) {
        background: transparent;
    }
</style>