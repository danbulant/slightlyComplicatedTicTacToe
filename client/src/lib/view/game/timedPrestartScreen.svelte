<script>
    import { onMount } from "svelte";
    import PrestartScreen from "../components/prestartScreen.svelte";

    let visible = true;

    onMount(() => {
        let i = setTimeout(() => {
            visible = false;
        }, 2000);
        return () => clearTimeout(i);
    });
</script>

{#if visible}
    <PrestartScreen />
{/if}