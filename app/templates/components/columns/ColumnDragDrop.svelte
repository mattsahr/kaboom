<script>
    import { onMount } from 'svelte';
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";
    import GalleryStore from '../../store/store';
    import GalleryItem from '../GalleryItem.svelte';
    import { getDocWidth } from '../../utility/dom';

    const flipDurationMs = 200;

    let mode = 'single';
    let updateStoreTimer = null;

    const batchify = (allImages) => {
        // const source = [...allImages];
        const imageCount = allImages.length;
        const columns = Math.max(1, Math.floor(getDocWidth() / 180));
        const columnSize = Math.max(4, Math.ceil(allImages.length/columns));

        const batch = [];
        let index = 0;

        for (let i = 0; i < imageCount; i += columnSize) {
            batch.push({ columnId: index, items: allImages.slice(i, i+ columnSize) });
            index++;
        }

        console.log('columns', columns, '  columnSize', columnSize, '  Batch!', batch);
        return batch;
    };

    $: imageBatches = batchify($GalleryStore.images);
    $: boardClass = 'column-board' + ' ' + mode;

    const updateStore = () => {
        const update = [];
        for (const batch of imageBatches) {
            for (const next of batch.items) {
                update.push(next);
            }
        }
        GalleryStore.updateImages(update);
    };

    function handleDndConsider(cId, e) {
        // GalleryStore.updateImages(e.detail.items);

        const index = imageBatches.findIndex(c => c.columnId === cId);
        console.log('CONSIDER cId', cId, ' index', index);
        imageBatches[index].items = e.detail.items;
        imageBatches = [...imageBatches];        
    }

    function handleDndFinalize(cId, e) {
        // GalleryStore.updateImages(e.detail.items);
        const index = imageBatches.findIndex(c => c.columnId === cId);
        console.log('FINALIZE cId', cId, ' index', index);
        imageBatches[index].items = e.detail.items;
        imageBatches = [...imageBatches]; 

        clearTimeout(updateStoreTimer);
        updateStoreTimer = setTimeout(updateStore, 500);
    }

    const updateBatches = () => {
        setTimeout(() => {
            imageBatches = batchify($GalleryStore.images);
        }, 100);
    };

    onMount(() => {
        window.addEventListener('resizeend', updateBatches);
    });

    /*
    <div class="column-board">
    {#each imageBatches as column(column.columnId)}
        <div class="gallery-list" use:dndzone={{items: $GalleryStore.images, flipDurationMs}} 
            on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
            {#each $GalleryStore.images as imgData(imgData.fileName)}
                <div class="drag-animator"  animate:flip="{{duration: flipDurationMs}}">
                    <GalleryItem {imgData} />
                </div>
            {/each}
        </div>
    {/each}
</div>
    */

const handleToggle = () => {
    if (mode === 'single') {
        mode =  'compact';
    } else {
        mode = 'single';
    }
};

</script>

<div class="toggle" on:click={handleToggle}>XY</div>
<div class={boardClass}>
    {#each imageBatches as column(column.columnId)}
        <div class="gallery-list" 
            use:dndzone={{items: column.items, flipDurationMs}}
            on:consider={(e) => handleDndConsider(column.columnId, e)} 
            on:finalize={(e) => handleDndFinalize(column.columnId, e)}>

            {#each column.items as imgData(imgData.fileName)}
                <div class="drag-animator"  animate:flip="{{duration: flipDurationMs}}">
                    <GalleryItem viewLightbox={GalleryStore.viewLightbox} {imgData} {mode} />
                </div>
            {/each}

        </div>
    {/each}
</div>

<style>
    .column-board {
    }

    .toggle {
        top: 42px;
        right: 6px;
        height: 32px;
        width: 32px;
        position: fixed;
        z-index: 20;
        border: solid rgb(200, 200, 200);
        border-width: 2px;
        padding: 4px 0 0 8px;
        cursor: pointer;
        border-radius: 4px;
    }
    .toggle:hover {
        background-color: rgb(240, 230, 220);
    }

    .column-board.compact {
        display: flex;
        overflow-y: scroll;
    }
    .gallery-list {
        margin: 0 auto;
        max-width: 560px;
        padding: 0;
        width: 100%;
    }
    .column-board.compact .gallery-list {
        margin: 0;
        border: solid rgb(180, 180, 180);
        border-width: 0 3px 0 3px;

    }
</style>
