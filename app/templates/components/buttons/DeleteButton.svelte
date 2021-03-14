<script>
    import { fly } from 'svelte/transition';

    // MODAL CONFIRM POP-UP
    import { getContext } from 'svelte';
    import confirmModal from './confirm-modal.js';
    const { open, close } = getContext('simple-modal');


    export let deleteItem;
    export let imgData;

    const actuallyDelete = () => {
        deleteItem(imgData.fileName);
    };

    // MODAL CONFIRM POP-UP
    const confirmDelete = confirmModal({
        message: 'Permanently delete this image?',
        action: actuallyDelete,
        open,
        close
    });

</script>

<div class="delete-button" 
    out:fly="{{ x: 200, duration: 250 }}" 
    in:fly="{{ x: 200, duration: 250 }}" 
    on:click={confirmDelete}>
    Delete
</div>

<style>
    .delete-button {
        position: absolute;
        bottom: 0;
        right: 54px;
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

    .delete-button:hover {
        opacity: 1;
        background-color: white;
    }
</style>