<script>
    export let hideItem;
    export let imgData;
    const onClick = () => {
        hideItem(imgData.fileName);
    }
</script>

<div class="hide-button" on:click={onClick}>
    Hide
</div>

<style>
    .hide-button {
        position: absolute;
        bottom: 0;
        right: 0px;
        height: 24px;
        width: 54px;
        border-radius: 4px 0 0 0;
        border: solid rgb(210, 220, 230);
        border-width: 1px 0 0 1px;
        text-transform: uppercase;
        font-size: 10px;
        text-align: center;
        padding: 3px 0 0 0;
        letter-spacing: 0.05em;
        cursor: pointer;
        opacity: 0.7;
    }

    .hide-button:hover {
        opacity: 1;
        background-color: white;
    }
</style>