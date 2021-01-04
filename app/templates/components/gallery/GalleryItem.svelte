<script>
    import { fade } from 'svelte/transition';
    import Intersector from './Intersector.svelte';
    import GalleryImage from './GalleryImage.svelte';
    import GalleryDescription from './GalleryDescription.svelte';
    import Settings from './GalleryItemSettings.svelte';
    import UnHideButton from './UnHideButton.svelte';
    import MdExpandLess from 'svelte-icons/md/MdExpandLess.svelte';
    import MdExpandMore from 'svelte-icons/md/MdExpandMore.svelte';

    export let imgData;
    export let mode;
    export let hideItem = false;
    export let setPromo = false;
    export let unhideItem = false;
    export let viewLightbox = () => false;
    export let updateDescription = () => false;
    export let updatePromoDescription = () => false;

    let promoCollapsed = false;
    const togglePromoCollapse = () => {
        promoCollapsed = !promoCollapsed;
    };

    $: frameClass = 'photo-frame' + ' ' + mode;
    $: promoClass = 'promo-description' + (promoCollapsed ? ' collapsed' : '');
</script>

<!-- ====================================== HTML =============================================== -->


<div class={frameClass}>
    {#if hideItem}
        <Settings {hideItem} {imgData} {setPromo} />
    {/if}

    {#if unhideItem}
        <UnHideButton {unhideItem} {imgData} />
    {/if}

    <Intersector once={true} let:intersecting={intersecting}>
        <GalleryImage {viewLightbox} {imgData} show={intersecting} />
    </Intersector>

    {#if mode !== 'arrange'}
        <GalleryDescription {imgData} 
            {updateDescription} />
    {/if}

    {#if mode !== 'arrange' && imgData.isPromo}
        <div class={promoClass} in:fade>
            <div class="promo-label">Promo Description
                <div class="collapse-me" on:click={togglePromoCollapse}>
                    {#if promoCollapsed}<MdExpandMore />{:else}<MdExpandLess />{/if}
                </div>
            </div>
            <GalleryDescription {imgData} isPromo="isPromo"
                updateDescription={updatePromoDescription} />
        </div>
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

    .promo-description {
        z-index: 30;
        right: 240px;
        position: absolute;
        top: 2px;
        width: 200px;
        height: 100%;
        background: rgb(230, 250, 255);
        border-radius: 4px;
        border: solid 1px rgb(150, 210, 230);
        box-shadow: 4px 4px 4px rgb(0, 0, 0, 0.1);
        transition: height 400ms;
    }

    .promo-description.collapsed {
        overflow: hidden;
        height: 38px;
    }

    .promo-description .collapse-me {
        position: absolute;
        width: 38px;
        height: 38px;
        top: 0;
        right: 0;
        padding: 3px 0 0 4px;
    }

    .promo-label {
        font-weight: bold;
        font-size: 14px;
        text-transform: uppercase;
        padding: 8px 16px 0 12px;
        height: 38px;
        border-bottom: solid 1px rgb(150, 210, 230);
        margin: 0 0 50px 0;
        color: rgb(40, 150, 180);
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
        .promo-description {
            left: 20px;
            right: inherit;
        }
    }

</style>
