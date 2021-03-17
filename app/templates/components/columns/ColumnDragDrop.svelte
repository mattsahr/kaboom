<script>
    import { onMount } from 'svelte';
    import { fade } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";
    import { GALLERY_IS_HOME_PAGE } from '../../utility/constants';
    import { getDocWidth } from '../../utility/dom';
    import GalleryStore from '../../store/store';
    import UXStore from '../../store/ux-store';
    import GalleryItem from '../gallery-items/GalleryItem.svelte';
    import MdShuffle from 'svelte-icons/md/MdShuffle.svelte';
    import HiddenPixManager from './HiddenPixManager.svelte';
    import MdClose from 'svelte-icons/md/MdClose.svelte';

    const flipDurationMs = 200;
    let mode = 'single';

    const batchify = (allImages) => {
        // const source = [...allImages];
        const imageCount = allImages.length;
        const columns = Math.max(1, Math.floor(getDocWidth() / 180));
        const columnSize = Math.max(4, Math.ceil(allImages.length / columns));

        const batch = [];
        let index = 0;

        for (let i = 0; i < imageCount; i += columnSize) {
            batch.push({ columnId: index, items: allImages.slice(i, i+ columnSize) });
            index++;
        }

        // console.log('columns', columns, '  columnSize', columnSize, '  Batch!', batch);

        console.log('batch', batch);
        return batch;
    };

    $: isHomePage = Boolean($GalleryStore[GALLERY_IS_HOME_PAGE]);
    $: hiddenPix = $GalleryStore.images.filter(image => image.hidden);
    $: visiblePix = $GalleryStore.images.filter(image => !image.hidden);
    $: gotHidden = hiddenPix.length;
    $: imageBatches = batchify(visiblePix);
    $: boardClass = 'column-board' + ' ' + mode + ($UXStore.manageHiddenPix ? ' inactive' : '');
    $: hiddenPixClass = 'manage-hidden-toggle' + ($UXStore.manageHiddenPix ? ' active' : '');

    const updateStore = () => {
        const update = [];
        for (const batch of imageBatches) {
            for (const next of batch.items) {
                update.push(next);
            }
        }
        for (const next of hiddenPix) {
            update.push(next);
        }
        GalleryStore.updateImages(update);
    };

    const hideItem = fileName => {
        GalleryStore.hide(fileName);
    };

    const deleteItem = fileName => {
      GalleryStore.deleteImage(fileName);  
    };

    /*
    function handleDndConsider(cId, e) {
        const index = imageBatches.findIndex(c => c.columnId === cId);
        imageBatches[index].items = e.detail.items;
        imageBatches = [...imageBatches];        
    }
    */

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
        $UXStore.manageHiddenPix = false;
        if (mode === 'single') {
            mode = 'arrange';
        } else {
            updateStore();
            mode = 'single';
        }
    };

    const toggleHiddenManager = () => {
        if (!$UXStore.manageHiddenPix) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        $UXStore.manageHiddenPix = !($UXStore.manageHiddenPix);
    };

</script>

<!-- ====================================== HTML =============================================== -->


<div class="arrange-toggle" on:click={handleToggle}><MdShuffle /></div>

{#if gotHidden}
    <div class={hiddenPixClass} in:fade on:click={toggleHiddenManager}>
        Hidden Pix
        <MdClose />
    </div>
{/if}

{#if $UXStore.manageHiddenPix}
    <HiddenPixManager />
{/if}

<div class={boardClass}>
    {#each imageBatches as column(column.columnId)}
        {#if column.items && column.items.length}
            <div class="gallery-list" 
                use:dndzone={{items: column.items, flipDurationMs, dragDisabled: mode !== 'arrange'}}
                on:consider={(e) => handleDndFinalize(column.columnId, e)} 
                on:finalize={(e) => handleDndFinalize(column.columnId, e)}>

                {#each column.items as imgData(imgData.fileName)}
                    <div class="drag-animator"  animate:flip="{{duration: flipDurationMs}}">
                        <GalleryItem {imgData} {mode} {hideItem} {deleteItem} unhideItem={false}
                            isHomePage={isHomePage}
                            setPromo={GalleryStore.setPromo}
                            updateDescription={GalleryStore.updateDescription}
                            updatePromoDescription={GalleryStore.updatePromoDescription}
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

    .arrange-toggle,
    .manage-hidden-toggle {
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

    .manage-hidden-toggle {
        right: 78px;
        width: 80px;
        text-align: center;
        padding: 4px 0 0 0;
        text-transform: uppercase;
        font-size: 12px;
        transition: padding 400ms, width 400ms;
    }

    .manage-hidden-toggle :global(svg) {
        display: block;
        position: absolute;
        top: 0;
        right: 2px;
        width: 20px;
        height: 20px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 400ms;
    }

    .manage-hidden-toggle.active {
        background-color: rgb(255, 195, 70);
        height: 35px;
        border-radius: 4px 4px 0 0;
        border-bottom-width: 1px;
        width: 120px;
        color: rgb(80, 80, 80);
        padding: 6px 6px 0 0;
    }

    .manage-hidden-toggle.active :global(svg) {
        opacity: 0.4;
    }

    .arrange-toggle:hover,
    .manage-hidden-toggle:hover {
        background-color: rgb(240, 240, 240);
    }

    :global(.column-board.arrange) {
        display: flex;
        overflow-y: scroll;
    }
    :global(.gallery-list) {
        margin: 0 auto;
        max-width: 1060px;
        padding: 0;
        width: 100%;
    }

    :global(.column-board.arrange .gallery-list) {
        margin: 0 4px 0 4px;
        box-shadow: 2px 2px 10px rgb(0, 0, 0, 0.5);
        max-width: 400px;
    }

    .single :global(.drag-animator:focus) {
        outline: none;
    }

    .column-board.inactive {
        opacity: 0;
        pointer-events: none;
    }

    @media all and (min-width: 1080px) {
        .arrange-toggle {
            right: 50%;
            margin-right: -520px;
        }
        .manage-hidden-toggle {
            right: 50%;
            margin-right: -440px;
        }
    }

</style>
