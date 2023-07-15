<script>
	import DarkmodeIcon from "$lib/DarkmodeIcon.svelte";
	import { themeStore } from "$lib/themeStore";
    import { onMount } from "svelte";
	import { quadOut } from "svelte/easing";
	import { fly } from "svelte/transition";

    const duration = 400;

    var shown = false;

    onMount(() => {
        shown = true;
    });

    function toggleDarkmode() {
        if($themeStore == "dark") {
            $themeStore = "light";
        } else {
            $themeStore = "dark";
        }
    }
</script>

<svelte:head>
    <title>Ultimate tictactoe</title>
</svelte:head>

{#if shown}
<main class="flex items-center justify-center flex-col">
    <div class="chooser grid-cols-2 lt-md:grid-cols-1">
        <a href="/localplay" class="single" in:fly={{ delay: 0, duration, opacity: 0, y: 100, easing: quadOut }}>
            <h1>Local multiplayer</h1>

            <div class="computer lt-md:hidden"></div>

            <p>A game for two on a single device</p>
        </a>
        <a href="/multiplayer" class="multi" in:fly={{ delay: duration * 0.5, duration, opacity: 0, y: 100, easing: quadOut }}>
            <h1>Online multiplayer</h1>

            <div class="multiplayer lt-md:hidden"></div>
    
            <p>Play with 2 devices, even across the ocean.</p>
        </a>
    </div>
    <a href="/rules" class="rules" in:fly={{ delay: duration, duration, opacity: 0, y: 100, easing: quadOut }}>
        <div class="icon">
            <svg fill="currentColor" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                width="800px" height="800px" viewBox="0 0 973.1 973.1" xml:space="preserve"
                >
                <g>
                    <path d="M502.29,788.199h-47c-33.1,0-60,26.9-60,60v64.9c0,33.1,26.9,60,60,60h47c33.101,0,60-26.9,60-60v-64.9
                        C562.29,815,535.391,788.199,502.29,788.199z"/>
                    <path d="M170.89,285.8l86.7,10.8c27.5,3.4,53.6-12.4,63.5-38.3c12.5-32.7,29.9-58.5,52.2-77.3c31.601-26.6,70.9-40,117.9-40
                        c48.7,0,87.5,12.8,116.3,38.3c28.8,25.6,43.1,56.2,43.1,92.1c0,25.8-8.1,49.4-24.3,70.8c-10.5,13.6-42.8,42.2-96.7,85.9
                        c-54,43.7-89.899,83.099-107.899,118.099c-18.4,35.801-24.8,75.5-26.4,115.301c-1.399,34.1,25.8,62.5,60,62.5h49
                        c31.2,0,57-23.9,59.8-54.9c2-22.299,5.7-39.199,11.301-50.699c9.399-19.701,33.699-45.701,72.699-78.1
                        C723.59,477.8,772.79,428.4,795.891,392c23-36.3,34.6-74.8,34.6-115.5c0-73.5-31.3-138-94-193.4c-62.6-55.4-147-83.1-253-83.1
                        c-100.8,0-182.1,27.3-244.1,82c-52.8,46.6-84.9,101.8-96.2,165.5C139.69,266.1,152.39,283.5,170.89,285.8z"/>
                </g>
            </svg>
        </div>
        <div>
            <h1>Rules</h1>
            <p>How do I play the game?</p>
        </div>
    </a>
    <div class="darkmode">
        <button on:click={toggleDarkmode} in:fly={{ delay: duration * 1.5, duration, opacity: 0, y: 100, easing: quadOut }}>
            <DarkmodeIcon />
            Toggle dark mode
        </button>
    </div>
</main>
{/if}

<style>
    .computer {
        @apply w-full bg-black;
        aspect-ratio: 1/1;
        mask: url('/computer.svg') no-repeat center;
        -webkit-mask: url('/computer.svg') no-repeat center;
    }
    .multiplayer {
        @apply w-full bg-black;
        aspect-ratio: 1/1;
        mask: url('/network.svg') no-repeat center;
        -webkit-mask: url('/network.svg') no-repeat center;
    }
    @media (max-height: 728px) {
        .computer, .multiplayer {
            display: none;
        }
        h1 {
            margin: 0;
        }
    }
    :global(.dark) .computer, :global(.dark) .multiplayer {
        @apply bg-white;
    }
    button {
        @apply p-4 rounded-lg bg-transparent border-none cursor-pointer flex items-center justify-center gap-4;
    }
    button:hover {
        @apply bg-black/10;
    }
    :global(.dark) button {
        @apply text-white;
    }
    :global(.dark) button:hover {
        @apply bg-white/10;
    }
    main {
        @apply my-4 p-4 w-max m-auto h-100vh;
    }
    .chooser {
        @apply grid items-center justify-center gap-8;
    }
    .chooser > a {
        @apply text-black no-underline cursor-pointer w-full p-8 border rounded-lg border-gray-400 border-solid;
    }
    :global(.dark) .chooser > a {
        @apply text-white;
    }
    .chooser > a:hover {
        @apply bg-black/10;
    }
    :global(.dark) .chooser > a:hover {
        @apply bg-white/10;
    }
    .rules {
        @apply text-gray-500 flex justify-center items-center w-full my-8 p-4 border rounded-lg border-gray-400 border-solid;
    }
    .rules:hover {
        @apply bg-black/10;
    }
    :global(.dark) .rules:hover {
        @apply bg-white/10;
    }
    .icon {
        @apply h-20 w-20 mr-4;
    }
    .icon svg {
        @apply w-full h-full;
    }
    .chooser h1 {
        @apply text-4xl text-center font-bold;
    }
    .rules h1 {
        @apply text-4xl font-bold;
    }
    p {
        @apply text-gray-500 text-center;
    }

    * {
        @apply box-border;
    }
</style>