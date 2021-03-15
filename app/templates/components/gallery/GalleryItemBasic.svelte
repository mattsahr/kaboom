<script>
    import Intersector from './Intersector.svelte';
    import GalleryImage from './GalleryImage.svelte';
    import GalleryDescriptionBasic from './GalleryDescriptionBasic.svelte';

    export let imgData;
    export let isHomePage = false;
    export let viewLightbox = () => false;
</script>

<!-- ====================================== HTML =============================================== -->


<div class="photo-frame">
    <Intersector once={true} let:intersecting={intersecting}>
        <GalleryImage {viewLightbox} {imgData} show={intersecting} />
    </Intersector>
    <GalleryDescriptionBasic {imgData} {isHomePage} />
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

    @media all and (max-width: 800px) {
        .photo-frame {
            padding: 24px 10px 18px 18px;
        }
    }

    @media all and (max-width: 599px) {
        .photo-frame {
            flex-wrap: wrap;
            padding: 20px 10px 10px 10px;
            margin: 0;
        }
    }

</style>