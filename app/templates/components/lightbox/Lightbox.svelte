<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { sineOut } from 'svelte/easing';
    import GalleryStore from '../../store/store';
    import { getSizedPath } from '../../utility/helpers';
    import { getDocHeight, getDocWidth } from '../../utility/dom';
    import { dummyImage } from '../../utility/constants';
    // import { zoomify, image_zoom_in, image_zoom_out, destroyZoomify } from './zoomify';
    import WZoom from './wzoom/wheel-zoom';

    import IconMagnify from '../icons/IconMagnify.svelte';
    import IconDeMagnify from '../icons/IconDeMagnify.svelte';
    import IconChevronLeft from '../icons/IconChevronLeft.svelte';
    import IconChevronRight from '../icons/IconChevronRight.svelte';
    import IconX from '../icons/IconX.svelte';

    let loaded = false;
    let slideDirection = '';
    // let scale = 1;
    let imgEl;
    let zoomer;

    const srcSizes = [
        ['tiny', '400w'],
        ['small', '600w'],
        ['medium', '1180w'],
        ['large', '1700w']
    ];

    const getSrcSizes = fileName => ([size, width]) => getSizedPath(size, fileName) + ' ' + width;

    const closeMe = () => { 
        slideDirection = '';
        loaded = false;
        // scale = 1;
        if (zoomer) { 
            zoomer.destroy(); 
            zoomer = null;
        }
        GalleryStore.closeLightbox(); 
    };


    const onImageLoad = () => {
        console.log('lightbox loaded?', loaded);
        loaded = true;
        if (!zoomer) {
            const zoomProps = {
                minScale: 1,
                maxScale: 5,
                speed: 6,
                dragScrollableOptions: {
                    smoothExtinction: true
                },
                zoomOnClick: false
                // width: workingWidth,
                // height: workingHeight
            };

            zoomer = WZoom.create(imgEl, zoomProps);

            console.log('zoomer!', zoomer);
        }
    };

    const fadeSlow = { delay: 200, duration: 600 };
    const fadeQuick = { delay: 100, duration: 300 };

    const composeScale = (height, width) => {
        const ratio = height / width;
        if (ratio > 1) {
            return 'width:' + (getDocHeight() / ratio).toFixed(1) + 'px; ' +
                'height:' + getDocHeight() + 'px;';
        }
        return 'width:' + getDocWidth() + 'px; ' +
            'height:' + (getDocWidth() * ratio).toFixed(1) + 'px;';
    };

    const calcHeight = data => {
        const { width, height } = data;
        const ratio = height / width;
        if (ratio > 1) {
            return getDocHeight() + 'px';
        }
        return (getDocWidth() * ratio).toFixed(1) + 'px';
    };

    const calcWidth = data => {
        const { width, height } = data;
        const ratio = height / width;
        if (ratio > 1) {
            return (getDocHeight() / ratio).toFixed(1) + 'px';
        }
        return getDocWidth() + 'px';
    };


    $: active = $GalleryStore.active;
    $: current = $GalleryStore.current;
    $: arrived = $GalleryStore.active;
    $: currentIndex = $GalleryStore.images.findIndex(next => next.fileName === current);
    $: imgData = $GalleryStore.images[currentIndex];
    $: data = imgData || dummyImage;
    $: fileName = data.fileName;
    $: width = data.width;
    $: height = data.height;
    $: ratio = height / width;
    $: workingHeight = calcHeight(data);
    $: workingWidth = calcWidth(data);
    $: photoClass = 'photo ' + (ratio > 1 ? 'tall' : ratio < 1 ? 'wide' : 'square');
    $: alt = data.title || 'image';
    $: src = active ? getSizedPath('small', fileName) : '';
    $: srcset = !active 
        ? ''
        : Boolean(zoomer)
            ? getSizedPath('large', fileName) + ' 300w'
            : srcSizes.map(getSrcSizes(fileName)).join(',');
    $: svgSequence = data.svgSequence;
    $: svgHeight = data.svgHeight;
    $: svgWidth = data.svgWidth;
    $: lightboxClass = 'lightbox' + (active ? ' active': '');
    $: photoSvgClass = 'photo-svg' + (loaded ? ' image-loaded': '');
    $: photoScale = composeScale(height, width);

    const reset = () => {
        loaded = false;
    };

    const zoomIn = () => {
        if (zoomer) { zoomer.zoomUp(); }
        // scale = (scale * 1.33 >= 5 ? 5 : scale * 1.33);
        // photoScale = composeScale(height, width, scale);
    };

    const zoomOut = () => {
        if (zoomer) { zoomer.zoomDown(); }
        // scale = (scale * 0.7 <= 1 ? 1 : scale * 0.7);
        // photoScale = composeScale(height, width, scale);
    };

    function slideOut(node, { delay = 0, duration = 150 }) {
        return {
            delay,
            duration,
            css: t => {
                if (!slideDirection) { return ''; }
                const direction = slideDirection === 'forward' ? 1 : -1;
                const eased = sineOut(t);
                return `transform: translate(${direction *(-105 + (eased * 105))}%, 0)`;
            }
        };
    }

    function slideIn(node, { delay = 0, duration = 350 }) {
        return {
            delay,
            duration,
            css: t => {
                if (!slideDirection) { return ''; }
                const direction = slideDirection === 'forward' ? 1 : -1;
                const eased = sineOut(t);
                return `transform: translate(${direction * (105 - (eased * 105))}%, 0)`;
            }
        };
    }

    const showNext = () => {
        slideDirection = 'forward';

        if (zoomer) {
            zoomer.destroy();
            zoomer = null;
        }

        arrived = false;
        const nextIndex = currentIndex === $GalleryStore.images.length - 1 ? 0 : currentIndex + 1;
        const nextFileName = $GalleryStore.images[nextIndex].fileName;

        setTimeout(() => {
            loaded = false;
            GalleryStore.viewLightbox(nextFileName);
            setTimeout(() => { if(zoomer) { zoomer.prepare(); }  }, 400);
        }, 140);


    };

    const showPrior = () => {
        slideDirection = 'previous';

        if (zoomer) {
            zoomer.destroy();
            zoomer  = null;
        }

        arrived = false;
        const priorIndex = currentIndex === 0 ? $GalleryStore.images.length - 1 : currentIndex - 1;
        const priorFileName = $GalleryStore.images[priorIndex].fileName;

        setTimeout(() => {
            loaded = false;
            GalleryStore.viewLightbox(priorFileName);
            setTimeout(() => { if(zoomer) { zoomer.prepare(); }  }, 400);
        }, 140);

    };

    onMount(reset);

</script>

{#if active}
<div class={lightboxClass} in:fade out:fade>

    <div class="icon-button magnify" on:click={zoomIn}><IconMagnify /></div>
    <div class="icon-button de-magnify" on:click={zoomOut}><IconDeMagnify /></div>
    <div class="icon-button close-me" on:click={closeMe}><IconX /></div>

    <div class="prior" on:click={showPrior}><IconChevronLeft /></div>
    <div class="next" on:click={showNext}><IconChevronRight /></div>

    {#if arrived}
    <div class="photo-frame" in:slideIn out:slideOut>
        <div class="photo" style={photoScale}>

            {#if !loaded}
                <div class={photoSvgClass} out:fade={fadeSlow} >
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%"
                        viewbox={'0 0 ' + svgWidth + ' ' + svgHeight} >
                        {#if !loaded}
                            <rect x="0" y="0" out:fade={fadeQuick}
                                width={svgWidth} height={svgHeight} fill="#f0f0f0" />
                        {/if}
                        <g>
                            {#each svgSequence as [ fill, opacity, cx, cy, rx, ry ] }
                                <ellipse {fill} fill-opacity={opacity} {cx} {cy} {rx} {ry} />
                            {/each}
                        </g>
                    </svg>
                </div>
            {/if} <!-- end if loaded -->

            <img on:load={onImageLoad} {src} bind:this={imgEl} {srcset} {alt} />
        </div>
    </div>
    {/if} <!-- end if arrived -->

    <div class="description-panel">
        <div class="description"></div>
        <div class="download-button">Download</div>
    </div>
</div>
{/if}

<style>
    .lightbox {
        position: fixed;
        z-index: 400;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.95);
    }

    .photo-frame {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }

    .photo {
        margin: auto;
        position: absolute;
    }

    .photo img {
        display: block;
        user-select: none;
        width: 100%;
    }

/*
    .photo.wide img {
        width: 100%;
        height: auto;
    }

    .photo.tall img {
        width: auto;
        height: 100%;   
    }

    .photo.tall img,
    .photo.square img {
        width: auto;
        height: 100%;   
    }
*/
    .photo-svg {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 20;
        transition: opacity 2000ms;
        pointer-events: none;
        overflow: hidden;
    }

    .icon-button {
        position: absolute;
        width: 40px;
        height: 40px;
        background-color: rgba(20, 20, 20, 0.7);
        border-radius: 4px;
        cursor: pointer;
        z-index: 20;
        transition: opacity 250ms;
        opacity: 0.5;
    }

    .icon-button:hover {
        opacity: 1;
    }

    .magnify {
        top: 20px;
        right: 180px;
    }

    .de-magnify {
        top: 20px;
        right: 120px;
    }

    .close-me {
        top: 20px;
        right: 30px;
    }

    .prior {
        position: absolute;
        top: 80px;
        display: flex;
        align-items: center;
        left: 0;
        bottom: 80px;
        padding: 0 20px 0 20px;
        opacity: 0.7;
        border-radius: 0 20px 20px 0;
        background-color: rgba(0, 0, 0, 0);
        transition: background-color 400ms;
        z-index: 40;
        cursor: pointer;
    }

    .next {
        position: absolute;
        top: 80px;
        display: flex;
        align-items: center;
        right: 0;
        bottom: 80px;
        padding: 0 20px 0 20px;
        opacity: 0.7;
        border-radius: 20px 0 0 20px;
        background-color: rgba(0, 0, 0, 0);
        transition: background-color 400ms;
        z-index: 40;
        cursor: pointer;
    }

    .prior svg {
        width: 60px;
        height: 80px;
        margin: 0;
        cursor: pointer;
    }
    .next svg {
        width: 60px;
        height: 80px;
        margin: 0 -16px 0 16px;
        cursor: pointer;
    }


    .prior:hover,
    .next:hover {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .description-panel {
        position: absolute;
        bottom: 0;
        right: 0; 
        left: 0;
        height: 200px;
        background-color: rgba(0, 0, 0, 0.4);
    }

</style>