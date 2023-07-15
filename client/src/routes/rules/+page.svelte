<script lang="ts">
	import BackButton from '$lib/backButton.svelte';
</script>

<svelte:head>
	<title>Ultimate tictactoe</title>
</svelte:head>

<BackButton href="/" />

<main class="flex items-center h-screen justify-center flex-col">
	<div class="container">
		<h1 class="text-4xl font-bold text-center">Rules</h1>

		<div class="content">
			<p>Content</p>
		</div>
	</div>
</main>

<style>
	.container {
		@apply w-full;
		max-width: 1024px;
	}

	.content {
		font-size: 24px;
	}
</style>