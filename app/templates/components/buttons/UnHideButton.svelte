<script>
    export let unhideItem;
    export let imgData;
    const onClick = () => {
        unhideItem(imgData.fileName);
    }
</script>

<div class="un-hide-button" on:click={onClick}>
    Un-Hide
</div>

<style>
    .un-hide-button {
        position: absolute;
        bottom: 0;
        right: 0px;
        height: 24px;
        width: 74px;
        border-radius: 4px 0 0 0;
        border: solid rgb(210, 220, 230);
        border-width: 1px 0 0 1px;
        text-transform: uppercase;
        font-size: 10px;
        text-align: center;
        padding: 3px 0 0 0;
        letter-spacing: 0.05em;
        cursor: pointer;
        opacity: 0.5;
    }

    .un-hide-button:hover {
        opacity: 0.8;
        background-color: white;
    }
</style>