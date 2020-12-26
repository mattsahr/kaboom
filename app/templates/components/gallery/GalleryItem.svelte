<script>
    import Intersector from './Intersector.svelte';
    import GalleryImage from './GalleryImage.svelte';
    import GalleryDescription from './GalleryDescription.svelte';
    import HideButton from './HideButton.svelte';
    import UnHideButton from './UnHideButton.svelte';

    export let imgData;
    export let mode;
    export let hideItem = false;
    export let unhideItem = false;
    export let viewLightbox = () => false;
    export let updateDescription = () => false;
    // console.log('imgData', imgData);

    $: frameClass = 'photo-frame' + ' ' + mode;
</script>

<!-- ====================================== HTML =============================================== -->


<div class={frameClass}>
    {#if hideItem}
        <HideButton {hideItem} {imgData} />
    {/if}

    {#if unhideItem}
        <UnHideButton {unhideItem} {imgData} />
    {/if}

    <Intersector once={true} let:intersecting={intersecting}>
        <GalleryImage {viewLightbox} {imgData} show={intersecting} />
    </Intersector>
    {#if mode !== 'arrange'}
        <GalleryDescription {imgData} {updateDescription} />
    {/if}
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

    .photo-frame.arrange {
        padding: 20px 10px 10px 10px;
    }

    .photo-frame.arrange :global(.photo-inner-frame.photo-inner-frame) {
        margin-bottom: 24px;
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