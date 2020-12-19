<script>
    import { onMount } from 'svelte';
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";
    import GalleryStore from '../../store/store';
    import GalleryItem from '../gallery/GalleryItem.svelte';
    import { getDocWidth } from '../../utility/dom';
    import MdShuffle from 'svelte-icons/md/MdShuffle.svelte';

    const flipDurationMs = 200;
    let mode = 'single';

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

        // console.log('columns', columns, '  columnSize', columnSize, '  Batch!', batch);
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
        const index = imageBatches.findIndex(c => c.columnId === cId);
        imageBatches[index].items = e.detail.items;
        imageBatches = [...imageBatches];        
    }

    function handleDndFinalize(cId, e) {
        const index = imageBatches.findIndex(c => c.columnId === cId);
        imageBatches[index].items = e.detail.items;
        imageBatches = [...imageBatches]; 
    }

    const updateBatches = () => {
        setTimeout(() => {
            imageBatches = batchify($GalleryStore.images);
        }, 100);
    };

    onMount(() => {
        window.addEventListener('resizeend', updateBatches);
    });

    const handleToggle = () => {
        if (mode === 'single') {
            mode = 'arrange';
        } else {
            updateStore();
            mode = 'single';
        }
    };

</script>

<!-- ====================================== HTML =============================================== -->


<div class="arrange-toggle" on:click={handleToggle}><MdShuffle /></div>
<div class={boardClass}>
        {#each imageBatches as column(column.columnId)}
            {#if column.items && column.items.length}
                <div class="gallery-list" 
                    use:dndzone={{items: column.items, flipDurationMs, dragDisabled: mode !== 'arrange'}}
                    on:consider={(e) => handleDndConsider(column.columnId, e)} 
                    on:finalize={(e) => handleDndFinalize(column.columnId, e)}>


                    {#each column.items as imgData(imgData.fileName)}
                        <div class="drag-animator"  animate:flip="{{duration: flipDurationMs}}">
                            <GalleryItem {imgData} {mode}
                                updateDescription={GalleryStore.updateDescription}
                                viewLightbox={GalleryStore.viewLightbox}  />
                        </div>
                    {/each}

                </div>
            {/if}
        {/each}
</div>


<!-- ====================================== STYLES ============================================= -->
<style>
    .column-board {
    }

    .arrange-toggle {
        top: 2px;
        right: 6px;
        height: 32px;
        width: 32px;
        position: fixed;
        z-index: 400;
        padding: 0;
        color: rgb(190, 190, 190);
        border: solid rgb(200, 200, 200);
        border-width: 2px;
        cursor: pointer;
        border-radius: 4px;
    }
    .arrange-toggle:hover {
        background-color: rgb(240, 240, 240);
    }

    .column-board.arrange {
        display: flex;
        overflow-y: scroll;
    }
    .gallery-list {
        margin: 0 auto;
        max-width: 1060px;
        padding: 0;
        width: 100%;
    }

    .column-board.arrange .gallery-list {
        margin: 0 4px 0 4px;
        box-shadow: 2px 2px 10px rgb(0, 0, 0, 0.5);
    }

    @media all and (min-width: 1080px) {
        .arrange-toggle {
            right: 50%;
            margin-right: -520px;
        }
    }

</style>
