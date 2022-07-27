<script lang="ts">
    import { connection, lastError, list, listLoading } from "$lib/Websocket";
    import { onMount } from "svelte";
import Button from "../components/button.svelte";

    onMount(() => {
        let i = setInterval(() => {
            $connection?.refreshList();
        }, 2000);

        return () => clearInterval(i);
    });

    let creatingGame = false;
    let newGameName = "";
    let error = "";

    $: {
        if (newGameName.length > 64) {
            error = "Name is too long";
        } else {
            error = "";
        }
    }

    $: {
        if($lastError === "room_name_used") {
            error = $lastError;
            $lastError = "";
        }
    }

    function submit() {
        if (newGameName.length < 2) return error = "Name is too short";
        if (newGameName.length > 64) return error = "Name is too long";
        error = "Creating game...";
        $connection!.createGame(newGameName);
    }

    function connect(game: { name: string, count: number }) {
        $connection!.join(game.name);
    }
</script>

{#if creatingGame}
    <dialog open>
        <input on:submit={submit} type="text" name="name" placeholder="GAME NAME" bind:value={newGameName}>
        <div class="error">
            {error}
        </div>
        <div class="controls">
            <Button on:click={() => creatingGame = false}>CANCEL</Button>
            <Button on:click={submit}>SUBMIT</Button>
        </div>
    </dialog>
{/if}

<div class="container">
    <main>
        <div class="flex">
            <h1>Games - {$connection?.name}</h1>
            <Button on:click={() => creatingGame = true}>CREATE</Button>
        </div>
        <div class="status">
            {#if $listLoading} Loading... {/if}
        </div>
        <ul>
            {#if $list}
                {#each $list as game}
                    <li class="flex" on:click={() => connect(game)}>
                        <span>
                            {game.name}
                        </span>
                        <span>
                            {game.count}
                        </span>
                    </li>
                {/each}
            {/if}
        </ul>
    </main>
</div>

<style>
    dialog {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px) saturate(150%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        gap: 0.25em;
    }
    dialog input {
        font-size: 1.5rem;
        background-color: #85E65C;
        color: #bd5ce6;
        border: 10px solid #bd5ce6;
        border-radius: 0;
    }
    .container {
        width: 100vw;
        height: 100vh;
        background-color: #85E65C;
        color: #bd5ce6;
    }
    main {
        max-width: 700px;
        margin: auto;
    }
    .flex {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .status {
        height: 1.5em;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    li {
        height: 2em;
        line-height: 2em;
        padding: 0.5em;
        border: 1px solid #bd5ce6;
        border-radius: 0;
        margin: 0;
        font-size: 1.5rem;
        cursor: pointer;
    }
    input {
        font-family: inherit;
    }
</style>