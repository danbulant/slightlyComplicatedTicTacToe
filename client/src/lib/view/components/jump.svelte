<script>
	const radius = 10;
	export const color = 'rgb(161, 76, 76)';
	export const showfaces = false;
    export const duration = "0.5s"
</script>

<div class="dice" style="animation-duration: {duration}">
	<svg width="100" height="100" class="front" style="background-color: {color}">
		{#if showfaces}
			<circle cx="50" cy="50" r={radius} fill="black" />
		{/if}
	</svg>
	<svg width="100" height="100" class="top" style="background-color: {color}">
		{#if showfaces}
			<circle cx="33" cy="33" r={radius} fill="black" />
			<circle cx="66" cy="66" r={radius} fill="black" />
		{/if}
	</svg>
	<svg width="100" height="100" class="left" style="background-color: {color}">
		{#if showfaces}
			<circle cx="30" cy="30" r={radius} fill="black" />
			<circle cx="50" cy="50" r={radius} fill="black" />
			<circle cx="70" cy="70" r={radius} fill="black" />
		{/if}
	</svg>
	<svg width="100" height="100" class="back" style="background-color: {color}">
		{#if showfaces}
			<circle cx="25" cy="33" r={radius} fill="black" />
			<circle cx="50" cy="33" r={radius} fill="black" />
			<circle cx="75" cy="33" r={radius} fill="black" />
			<circle cx="25" cy="66" r={radius} fill="black" />
			<circle cx="50" cy="66" r={radius} fill="black" />
			<circle cx="75" cy="66" r={radius} fill="black" />
		{/if}
	</svg>
	<svg width="100" height="100" class="right" style="background-color: {color}">
		{#if showfaces}
			<circle cx="33" cy="33" r={radius} fill="black" />
			<circle cx="33" cy="66" r={radius} fill="black" />
			<circle cx="66" cy="33" r={radius} fill="black" />
			<circle cx="66" cy="66" r={radius} fill="black" />
		{/if}
	</svg>
	<svg width="100" height="100" class="bottom" style="background-color: {color}">
		{#if showfaces}
			<circle cx="30" cy="30" r={radius} fill="black" />
			<circle cx="30" cy="70" r={radius} fill="black" />
			<circle cx="70" cy="30" r={radius} fill="black" />
			<circle cx="70" cy="70" r={radius} fill="black" />
			<circle cx="50" cy="50" r={radius} fill="black" />
		{/if}
	</svg>
</div>

<style>
	svg {
		border-radius: 5px;
		border: 1px solid black;
		box-shadow: 0 0 2px black;
		position: absolute;
		backface-visibility: visible;
	}
	.front {
		transform: translateZ(50px);
	}
	.top {
		transform: rotateX(90deg) translateZ(50px);
	}
	.bottom {
		transform: rotateX(-90deg) translateZ(50px);
	}
	.left {
		transform: rotateY(-90deg) translateZ(50px);
	}
	.right {
		transform: rotateY(90deg) translateZ(50px);
	}
	.back {
		transform: rotateY(180deg) translateZ(50px);
	}
	.dice {
		width: 100px;
		height: 100px;
		position: relative;
		transform: rotate3d(1, 0, 0, 0deg);
		transform-style: preserve-3d;
		box-sizing: border-box;
		animation: jump 0.5s;
		animation-fill-mode: both;
	}
	@keyframes jump {
		0% {
			transform: rotate3d(1, 0, 0, 0deg) scale(1);
			animation-timing-function: ease-in;
		}
		60% {
			transform: rotate3d(1, 0, 0, 90deg) scale(1.4);
			animation-timing-function: ease-out;
		}
		100% {
			transform: rotate3d(1, 0, 0, 180deg) scale(1);
		}
	}
</style>
