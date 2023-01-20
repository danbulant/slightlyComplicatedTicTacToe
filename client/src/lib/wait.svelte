<script>
	import { quadOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	import { room } from "./websocket";

    const duration = 400;
</script>

<a href="/multiplayer" class="arrow-back fixed top-0 left-0 w-4 h-4 m-4 p-2 transform transition-transform hover:-translate-x-1">
    <svg width="16" height="16">
        <line y1="50%" x1="0" y2="50%" x2="100%" stroke="currentColor" stroke-width="2" />
        <line y1="50%" x1="0" y2="100%" x2="50%" stroke="currentColor" stroke-width="2" />
        <line y1="50%" x1="0" y2="0" x2="50%" stroke="currentColor" stroke-width="2" />
    </svg>
</a>

<main>
    <h1 in:fly={{ delay: 0, duration, opacity: 0, y: 100, easing: quadOut }}>Waiting for an opponent...</h1>
    <p in:fly={{ delay: duration * 0.5, duration, opacity: 0, y: 100, easing: quadOut }}>Currently in room <code>{$room?.name}</code>.</p>
</main>

<style>
    main {
        @apply w-100vw h-100vh flex flex-col items-center justify-center;
    }
    p {
        @apply text-gray-400;
    }
    a {
        @apply text-black;
    }
    code {
        @apply text-black;
    }
</style>