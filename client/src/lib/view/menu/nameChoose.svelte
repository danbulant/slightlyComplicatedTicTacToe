<script>
    import { connection, lastError, WebsocketConnection } from "$lib/Websocket";

    var name = "";
    var error = "";

    $: {
        if(name.length > 64) {
            error = "Name is too long";
        } else {
            error = "";
        }
    }

    function submit() {
        if (name.length < 2) return error = "Name is too short";
        if (name.length > 64) return error = "Name is too long";
        $connection = new WebsocketConnection(name);
    }
</script>

<div class="container">
    <main>
        <input on:submit={submit} type="text" name="name" placeholder="PLAYER NAME" bind:value={name}>
        <div class="error">
            {error || $lastError}
        </div>
        <button on:click={submit}>SUBMIT</button>
    </main>
</div>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    .container {
        width: 100vw;
        height: 100vh;
        background-color: #85E65C;
        color: #bd5ce6;
    }
    .error {
        height: 1.5em;
    }
    input {
        width: 20em;
        height: 2em;
        border: 10px solid #bd5ce6;
        border-radius: 0;
        padding: 0.5em;
        font-size: 1.5em;
        background-color: #85E65C;
        color: #bd5ce6;
        font-family: inherit;
    }
    button {
        width: 10em;
        height: 3em;
        border: 10px solid #bd5ce6;
        background-color: #85E65C;
        color: #bd5ce6;
        border-radius: 0;
        padding: 0.5em;
        font-size: 1.5em;
        font-family: inherit;
        cursor: pointer;
    }
    button:active {
        background-color: #bd5ce6;
        color: #85E65C;
    }
</style>