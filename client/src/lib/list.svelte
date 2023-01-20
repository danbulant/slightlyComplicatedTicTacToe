<script lang="ts">
	import { quadOut } from "svelte/easing";
	import { fade, fly } from "svelte/transition";
	import { connection, list } from "./websocket";
    
    const duration = 400;

    let createRoomOpen = false;
    let roomName = "";

    function create() {
        console.log("create room", roomName);
        $connection!.createGame(roomName);
    }
</script>

<main class="flex flex-col w-100vw h-100vh">
    <div class="p-4 flex justify-between border-b border-b-black border-b-solid">
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
                    <li>{room.name}</li>
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
    button {
        @apply w-64 h-10 px-2 border border-gray-300 bg-white mt-4 my-0;
    }
    dialog .header button {
        @apply w-12;
    }
    input {
        @apply w-64 h-10 px-2 border border-gray-300 rounded-l-lg mt-4 my-0;
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
</style>