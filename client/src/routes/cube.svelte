<script>
    const radius = 10;
</script>

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
</div>

<style>
    svg {
        border-radius: 5px;
        border: 1px solid black;
        box-shadow: 0 0 2px black;
        position: absolute;
    }
    .front {
        transform: translateZ(50px);
    }
    .top {
        transform: translateZ(50px) rotateX(90deg);
    }
    .left {
        transform: translateZ(50px) rotateY(-90deg);
    }
    .dice {
        margin-top: 20px;
        margin-left: 20px;
        position: relative;
    }
</style>