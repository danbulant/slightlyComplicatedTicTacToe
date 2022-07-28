<script lang="ts">
	import { connection, messages, players, room } from '$lib/Websocket';
	import Button from '../components/button.svelte';

	function startGame() {
        $connection!.startGame();
    }
    let content = "";
    function sendMessage() {
        if(!content.length || content.length > 512) return;
        $connection!.sendMessage(content);
        content = "";
    }
    $: if($messages.length > 512) {
        $messages = $messages.slice(-512);
    }
</script>

<div class="container">
	<div class="playerlist">
		<ul>
			<li>
				{$connection?.name}
				{#if $room?.host === $connection?.name}
					<span class="host">Host</span>
				{/if}
				<span class="state">YOU</span>
			</li>
			{#each [...$players.values()] as player (player.name)}
				<li>
					{player.name}
					{#if $room?.host === player.name}
						<span class="host">Host</span>
					{/if}
					<span class="state state-{player.readyState}"
						>{['joined', 'connecting', 'connecting...', 'ready', 'reconnecting'][
							player.readyState
						]}</span
					>
                    {#if player.pings && player.pings.length > 0}
                        <span class="pings">{Math.floor(player.pings.reduce((a, b) => a + b, 0) / player.pings.length * 10) / 10}ms</span>
                    {/if}
				</li>
			{/each}
		</ul>
	</div>
	<main>
        <div class="text">
            {#each $messages as message}
                <div class="message">
                    {#if message.author !== " SYS "}
                        <span class="name">{message.author}</span>:
                    {/if}
                    <span class="content">{message.content}</span>
                </div>
            {/each}
        </div>
        <div class="bottom">
            <form action="/" on:submit|preventDefault={sendMessage}>
                <input type="text" placeholder="Chat.." bind:value={content} on:submit|preventDefault={sendMessage}>
            </form>
            <Button on:click={() => sendMessage()}>Send</Button>
			{#if $room?.host === $connection?.name && $players.size > 0}
                <Button on:click={() => startGame()}>START GAME</Button>
            {:else}
                <Button disabled>WAIT TO START</Button>
			{/if}
        </div>
	</main>
</div>

<style>
    .pings {
        width: 3em;
        text-align: right;
        display: inline-block;
    }
	.container {
		width: 100vw;
		height: 100vh;
		background-color: #85e65c;
		color: #bd5ce6;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.playerlist {
		width: 20em;
		height: 100%;
		background-color: #85e65c;
		color: #bd5ce6;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-right: 10px solid #bd5ce6;
	}
	.state {
		font-size: 0.8em;
		margin-left: 0.5em;
		background-color: #bd5ce6;
		color: #85e65c;
		border-radius: 0.25em;
		padding: 0.3em;
	}
	.state.state-0 {
		background-color: red;
	}
	.state.state-3 {
		background-color: transparent;
		color: #000;
	}
	.state.state-4 {
		background-color: #ff0000;
		color: #000;
	}
	ul {
		list-style: none;
		padding: 0;
	}
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        height: calc(100vh - 40px);
    }
    .text {
        flex-grow: 1;
        width: calc(100% - 2rem);
        margin: 1em;
    }
    .bottom {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        flex-grow: 0;
        height: 2em;
        width: 100%;
    }
    form {
        flex-grow: 1;
    }
    input {
        width: 100%;
        background-color: #85e65c;
        color: #bd5ce6;
        font-size: 1.5em;
        font-family: inherit;
        padding: 0.5em;
        border: 10px solid #bd5ce6;
        border-left: none;
        border-right: none;
    }
    .text {
        overflow: auto;
    }
    .text .message {
        height: 1.5em;
    }
    .text .name {
        font-weight: bold;
        background-color: #bd5ce6;
        color: #85e65c;
        padding: 0.2em;
        border-radius: 0.25em;
    }
</style>
