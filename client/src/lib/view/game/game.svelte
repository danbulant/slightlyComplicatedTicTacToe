<script>
	import { gameData } from '$lib/Websocket';
	import GameOverlay from './gameOverlay.svelte';
	import Scene from './scene.svelte';
	import TimedPrestartScreen from './timedPrestartScreen.svelte';
	import Waiting from './waiting.svelte';
</script>

{#if !$gameData}
	<Waiting />
{:else}
	<TimedPrestartScreen />
	<GameOverlay>
		<Scene />
	</GameOverlay>
{/if}
