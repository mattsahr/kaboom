<script>
    export let message;
    export let onClick;
</script>

<div>
    <div class="message">
        {message}
    </div>
    <button on:click={onClick}>Delete</button>
</div>

<style>
    .message {
        padding: 14px 20px 12px 0;
    }

    button {
        display: block;
        padding: 8px 16px;
        background-color: rgb(240, 240, 240);
        border: solid 1px;
        border-color: rgb(200, 200, 200);
        width: 100%;
        cursor: pointer;
    }

    button:hover {
        background-color: rgb(250, 250, 250);
    }
</style>
