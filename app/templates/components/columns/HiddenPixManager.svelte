<script>
    import GalleryStore from '../../store/store';
    import UXStore from '../../store/ux-store';
    import GalleryItem from '../gallery-items/GalleryItem.svelte';
    import { getDocWidth } from '../../utility/dom';

    const flipDurationMs = 200;

    const batchify = (allImages, show) => {
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

    $: hiddenPix = $GalleryStore.images.filter(image => image.hidden);
    $: imageBatches = batchify(hiddenPix, $UXStore.manageHiddenPix);

    const closeIfEmpty = () => {
        if (hiddenPix.length < 1) {
            $UXStore.manageHiddenPix = false;
        }
    };

    const unhideItem = fileName => {
        GalleryStore.unhide(fileName);
        setTimeout(closeIfEmpty, 50);
    };

</script>


<!-- ====================================== HTML =============================================== -->

<div class="column-board arrange hidden-pix">
    {#each imageBatches as column(column.columnId)}
        {#if column.items && column.items.length}
            <div class="gallery-list" >
                {#each column.items as imgData(imgData.fileName)}
                    <GalleryItem {imgData} mode="arrange" hideItem={false} unhideItem={unhideItem}
                        updateDescription={GalleryStore.updateDescription}
                        viewLightbox={GalleryStore.viewLightbox}  />
                {/each}

            </div>
        {/if}
    {/each}
</div>

<!-- ====================================== STYLES ============================================= -->


<style>
    .hidden-pix .gallery-list {
        max-width: 300px;
    }

    .hidden-pix .gallery-list :global(.photo-inner-frame.photo-inner-frame) {
        margin-bottom: 30px;
    }
</style>