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
</script>

<div class="overflow-hidden w-100vw h-100vh dark:bg-black dark:text-white">
    <PageTransition url={data.url}>
        <slot />
    </PageTransition>
</div>

<style>
    :global(:root), :global(body) {
        @apply overflow-hidden w-100vw;
    }
    :global(*) {
        @apply transition-colors;
    }
</style>