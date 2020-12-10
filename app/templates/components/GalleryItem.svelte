<script>
    import Intersector from './Intersector.svelte';
    import GalleryImage from './GalleryImage.svelte';

    export let imgData;
    export let mode;
    export let viewLightbox = () => false;
    // console.log('imgData', imgData);

    $: frameClass = 'photo-frame' + ' ' + mode;
</script>

<!-- ====================================== HTML =============================================== -->


<div class={frameClass}>
    <Intersector once={true} let:intersecting={intersecting}>
        <GalleryImage {viewLightbox} {imgData} show={intersecting} />
    </Intersector>
    <div class="description-block">
        <div class="original">
            {imgData.description || 'Yo dawg.'}
        </div>
    </div>
</div>


<!-- ====================================== STYLES ============================================= -->
<style>
    .photo-frame {
        width: 100%;
        text-align: left;
        border: solid 1px #e6e6e6;
        background-color: #f8f8f8;
        margin: 0 0 6px 0;
        padding: 40px 10px 40px 40px;
        display: flex;
        flex-wrap: nowrap;
        position: relative;
    }

    .photo-frame.compact {
        padding: 20px 10px 10px 10px;
    }

    .photo-frame.compact .description-block {
        display: none;
    }

    .description-block {
        padding: 0 20px 0 0;
        font-size: 13px;
        line-height: 1.7;
        color: #505050;
        text-align: left;
        vertical-align: top;
        width: 200px;
        flex: 1 1 auto;
    }

    @media all and (max-width: 599px) {
        .photo-frame {
            flex-wrap: wrap;
            padding: 20px 10px 10px 10px;
        }

        .description-block {
            padding: 10px;
            width: 100%;
        }
    }

</style>