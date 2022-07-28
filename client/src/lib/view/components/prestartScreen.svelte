<script>
	const radius = 10;
</script>

<div class="container">
    <div class="dice">
        <svg width="100" height="100" class="front">
            <circle cx="50" cy="50" r={radius} fill="black" />
        </svg>
        <svg width="100" height="100" class="top">
            <circle cx="33" cy="33" r={radius} fill="black" />
            <circle cx="66" cy="66" r={radius} fill="black" />
        </svg>
        <svg width="100" height="100" class="left">
            <circle cx="30" cy="30" r={radius} fill="black" />
            <circle cx="50" cy="50" r={radius} fill="black" />
            <circle cx="70" cy="70" r={radius} fill="black" />
        </svg>
        <svg width="100" height="100" class="back">
            <circle cx="25" cy="33" r={radius} fill="black" />
            <circle cx="50" cy="33" r={radius} fill="black" />
            <circle cx="75" cy="33" r={radius} fill="black" />
            <circle cx="25" cy="66" r={radius} fill="black" />
            <circle cx="50" cy="66" r={radius} fill="black" />
            <circle cx="75" cy="66" r={radius} fill="black" />
        </svg>
        <svg width="100" height="100" class="right">
            <circle cx="33" cy="33" r={radius} fill="black" />
            <circle cx="33" cy="66" r={radius} fill="black" />
            <circle cx="66" cy="33" r={radius} fill="black" />
            <circle cx="66" cy="66" r={radius} fill="black" />
        </svg>
        <svg width="100" height="100" class="bottom">
            <circle cx="30" cy="30" r={radius} fill="black" />
            <circle cx="30" cy="70" r={radius} fill="black" />
            <circle cx="70" cy="30" r={radius} fill="black" />
            <circle cx="70" cy="70" r={radius} fill="black" />
            <circle cx="50" cy="50" r={radius} fill="black" />
        </svg>
    </div>
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
		background-color: rgba(255, 0, 0, 0.7);
	}
	.top {
		transform: rotateX(90deg) translateZ(50px);
		background-color: rgba(255, 255, 0, 0.7);
	}
	.bottom {
		transform: rotateX(-90deg) translateZ(50px);
		background-color: rgba(0, 255, 0, 0.7);
	}
	.left {
		transform: rotateY(-90deg) translateZ(50px);
		background-color: rgba(255, 0, 255, 0.7);
	}
	.right {
		transform: rotateY(90deg) translateZ(50px);
		background-color: rgba(0, 0, 255, 0.7);
	}
	.back {
		transform: rotateY(180deg) translateZ(50px);
		background-color: rgba(0, 0, 0, 0.7);
	}
	.dice {
		width: 100px;
		height: 100px;
		position: relative;
		transform: rotate3d(1, 0, 0, 0deg);
		transform-style: preserve-3d;
		box-sizing: border-box;
		animation: dice 1.2s 0.5s ease-in-out;
		animation-fill-mode: both;
	}
	@keyframes dice {
		0% {
			transform: rotate3d(0, 1, 0, 90deg); /* 3 */
		}
		50% {
			transform: rotate3d(1, 0, 0, -90deg); /* 2 */
		}
		100% {
			transform: rotate3d(1, 0, 0, 0deg); /* 1 */
		}
	}
    .container {
        width: 100vw;
        height: 100vh;
        background-color: #85E65C;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
