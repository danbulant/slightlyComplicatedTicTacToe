<script lang="ts">
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
    import { quadOut } from "svelte/easing";
	import { connection, WebsocketConnection } from "./websocket";

    var shown = false;

    onMount(() => {
        shown = true;
    });

    const duration = 400;
    var name = "";

    function submit() {
        $connection = new WebsocketConnection(name);
    }
</script>

{#if shown}
<main>
    <div class="top">
        <h1 in:fly={{ delay: 0, duration, opacity: 0, y: 100, easing: quadOut }}>What is your nickname</h1>
        <p in:fly={{ delay: duration*0.5, duration, opacity: 0, y: 100, easing: quadOut }}>This name is publicly visible and needs to be unique among the connected players.</p>
    </div>
    
    <form on:submit>
        <input on:submit bind:value={name} type="text" min={2} max={64} in:fly={{ delay: duration*1, duration, opacity: 0, y: 100, easing: quadOut }}>
        <button on:click={submit} on:keydown={submit} in:fly={{ delay: duration*1.5, duration, opacity: 0, y: 100, easing: quadOut }}>Continue</button>
    </form>
</main>
{/if}

<style>
    * {
        @apply box-border;
    }
    main {
        @apply flex items-center justify-center flex-col h-100vh w-full;
    }
    h1 {
        @apply m-0 text-4xl text-center;
    }
    p {
        @apply m-2 text-gray-500 text-center;
    }
    input {
        @apply w-64 h-10 px-2 border border-gray-300 rounded-l-lg mt-4 my-0;
    }
    button {
        @apply w-64 h-10 px-2 border border-gray-300 bg-white rounded-r-lg mt-4 my-0;
    }
    form {
        @apply h-50vh flex-grow-0;
    }
    .top {
        @apply h-50vh flex flex-col justify-end items-center;
    }
</style>