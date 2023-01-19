<script lang="ts">
	import PageTransition from "$lib/pageTransition.svelte";
    import "uno.css";

    import type { load } from "./+layout";
    export let data: Awaited<ReturnType<typeof load>>;

</script>

<div class="overflow-hidden w-100vw">
    <PageTransition url={data.url}>
        <slot />
    </PageTransition>
</div>

<style>
    :global(:root), :global(body) {
        @apply overflow-hidden w-100vw;
    }
</style>