<script lang="ts">
	import { onMount } from "svelte";
	import { quadOut } from "svelte/easing";
	import { fade, fly } from "svelte/transition";
	import { connection, list } from "./websocket";
    
    const duration = 400;

    let createRoomOpen = false;
    let roomName = $connection?.name ? `${$connection.name}'s room` : "";

    function create() {
        console.log("create room", roomName);
        $connection!.createGame(roomName);
    }

    function join(roomName: string) {
        console.log("join room", roomName);
        $connection!.join(roomName);
    }

    function disconnect() {
        $connection?.leave();
    }

    onMount(() => {
        let i = setInterval(() => {
            $connection?.refreshList();
        }, 10000); // should usually be synchronized just fine, this is to prevent desynchronization (and also works as a kind of ping)

        return () => clearInterval(i);
    })
</script>

<a href="/multiplayer" on:click={disconnect} class="arrow-back fixed top-0 left-0 w-4 h-4 m-4 mt-8 p-2 transform transition-transform hover:-translate-x-1">
    <svg width="16" height="16">
        <line y1="50%" x1="0" y2="50%" x2="100%" stroke="currentColor" stroke-width="2" />
        <line y1="50%" x1="0" y2="100%" x2="50%" stroke="currentColor" stroke-width="2" />
        <line y1="50%" x1="0" y2="0" x2="50%" stroke="currentColor" stroke-width="2" />
    </svg>
</a>

<div on:click={() => $connection?.refreshList()} on:keydown={() => $connection?.refreshList()} class="reload fixed top-0 left-10 w-4 h-4 m-4 p-2 transform transition-transform rotate-180 hover:rotate-360 active:rotate-540">
    <svg fill="currentColor" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    viewBox="0 0 489.645 489.645" xml:space="preserve" class="w-full h-full">
        <g>
            <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3
                c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5
                c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8
                c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2
                C414.856,432.511,548.256,314.811,460.656,132.911z"/>
        </g>
    </svg>
</div>

<main class="flex flex-col w-100vw h-100vh">
    <div class="p-4 pl-16 flex justify-between border-b border-b-black dark:border-b-white border-b-solid">
        <h1 in:fly={{ delay: 0, duration, opacity: 0, y: 100, easing: quadOut }}>Rooms</h1>
        <div class="right">
            <button in:fly={{ delay: duration * 0.5, duration, opacity: 0, y: 100, easing: quadOut }} disabled>Quick match</button>
            <button in:fly={{ delay: duration * 1, duration, opacity: 0, y: 100, easing: quadOut }} on:keydown={() => createRoomOpen = true} on:click={() => createRoomOpen = true}>Create room</button>
        </div>
    </div>
    <div class="content h-full overflow-auto" in:fly={{ delay: duration * 1.5, duration, opacity: 0, y: 100, easing: quadOut }}>
        {#if $list}
            <ul>
                {#each $list as room}
                    <li on:click={() => join(room.name)}>{room.name}</li>
                {/each}
            </ul>
        {:else}    
            Loading...
        {/if}
    </div>
</main>

{#if createRoomOpen}
    <div transition:fade={{ duration: 300, easing: quadOut }} class="bg bg-black/10 fixed inset-0 backdrop-blur" on:keydown={() => createRoomOpen = false} on:click={() => createRoomOpen = false}></div>
{/if}
<dialog open={createRoomOpen}>
    <div class="header flex p-8 justify-between border-b-solid border-b border-b-black">
        <h1>Create room</h1>
        <button class="rounded-lg" on:click={() => createRoomOpen = false}>X</button>
    </div>

    <div class="p-8 flex">
        <input placeholder="Room name" id="room-name" type="text" bind:value={roomName} />
        <button on:click={create}>Create</button>
    </div>
</dialog>

<style>
    a {
        @apply text-black;
    }
    ul {
        @apply list-none;
    }
    li {
        @apply cursor-pointer border-b border-b-solid border-b-gray-300 p-4;
    }
    button {
        @apply w-64 h-10 px-2 border border-gray-300 bg-white mt-4 my-0 cursor-pointer;
    }
    button:disabled {
        @apply bg-gray-300 cursor-not-allowed;
    }
    :global(.dark) button {
        @apply bg-white/15 border-gray-700 text-white;
    }
    :global(.dark) button:hover {
        @apply bg-white/10;
    }
    :global(.dark) button:disabled {
        @apply bg-black;
    }
    :global(.dark) button:disabled:hover {
        @apply bg-gray-900;
    }
    dialog .header button {
        @apply w-12;
    }
    :global(.dark) dialog {
        @apply bg-black border-gray-700 text-white;
    }
    input {
        @apply w-64 h-10 px-2 border border-gray-300 rounded-l-lg mt-4 my-0;
    }
    :global(.dark) input {
        @apply border-gray-400 text-white bg-black;
    }
    button:first-child {
        @apply rounded-l-lg;
    }
    button:last-child {
        @apply rounded-r-lg;
    }
    dialog {
        @apply hidden;
    }
    dialog[open] {
        @apply block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 m-0;
    }
    * {
        @apply box-border select-none;
    }
</style>