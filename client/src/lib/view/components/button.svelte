
<button on:click><slot /></button>

<style>
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