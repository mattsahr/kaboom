<script>
    import GalleryStore from '../../store/store';
    import GalleryItemBasic from '../gallery/GalleryItemBasic.svelte';
</script>

<!-- ====================================== HTML =============================================== -->


<div class="column-board">
    <div class="gallery-list">
        {#each $GalleryStore.images as imgData(imgData.fileName)}
            <GalleryItemBasic {imgData} 
                viewLightbox={GalleryStore.viewLightbox}  />
        {/each}
    </div>
</div>


<!-- ====================================== STYLES ============================================= -->
<style>
    .gallery-list {
        margin: 0 auto;
        max-width: 1060px;
        padding: 0;
        width: 100%;
    }
</style>
