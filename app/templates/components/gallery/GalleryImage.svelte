<script>
    import { fade } from 'svelte/transition';
    import { getSizedPath } from '../../utility/helpers';
    import { dummyImage } from '../../utility/constants';

    export let viewLightbox = () => {};
    const showPic = () => {
        viewLightbox(fileName);
    };

    const DEFAULT_SVG_HEIGHT = 170;
    const DEFAULT_SVG_WIDTH = 256;

    const srcSizes = [
        ['tiny', '400w'],
        ['small', '600w'],
        ['medium', '1180w']
        // ['large', '1700w']
    ];

    const getSrcSizes = (fileName, url) => ([size, width]) => 
        getSizedPath(size, fileName, url) + ' ' + width;

    const getPadding = (width, height) => {
        if (!height && !width) {
            return '50%';
        }
        if (height > width) { return '100%'; }
        return (100 * height / width).toFixed(2) + '%';
    };


    export let imgData;
    // export let galleryIndex;
    export let show;
    let loaded = false;

    const onImageLoad = () => {
        loaded = true;
    };
    const fadeSlow = { delay: 300, duration: 1600 };
    const fadeQuick = { delay: 200, duration: 600 };

    $: data = imgData || dummyImage;
    $: fileName = data.fileName;
    $: width = data.width;
    $: height = data.height;
    $: sourceURL = data.url;
    $: src = show ? getSizedPath('small', fileName, sourceURL) : '';
    $: srcset = show ? srcSizes.map(getSrcSizes(fileName, sourceURL)).join(',') : '';
    $: spacerStyle = 'padding: 0 0 ' + getPadding(width, height) + ' 0';
    $: alt = data.title ? data.title : 'image';
    $: svgSequence = data.svgSequence;
    $: svgHeight = data.svgHeight || DEFAULT_SVG_HEIGHT;
    $: svgWidth = data.svgWidth || DEFAULT_SVG_WIDTH;
    $: photoSvgClass = 'photo-svg' + (loaded ? ' image-loaded': '');
    $: svgScale = Number(svgWidth) === 256 
        ? '' 
        : 'transform: scale(' + (256 / Number(svgWidth)).toFixed(3) + ');';

</script>

<!-- ====================================== HTML =============================================== -->


<div class="photo-inner-frame">

    {#if !loaded}
        <div class={photoSvgClass} out:fade={fadeSlow} >
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%"
                viewbox={'0 0 ' + svgWidth + ' ' + svgHeight} style={svgScale} >
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
    {/if}

    <div class="photo-spacer" style={spacerStyle} />
    <img class:show on:load={onImageLoad} on:click={showPic} {src} {srcset} {alt} />
</div>


<!-- ====================================== STYLES ============================================= -->
<style>

    .photo-inner-frame {
        margin: 0 30px 0 0;
        display: block;
        flex: 100 1 auto;
        position: relative;
        cursor: pointer;
        user-select: none;
    }
    .photo-spacer {
        width: 100%;
    }

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

    .photo-inner-frame img {
        display: block;
        width: 100%;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
    }

    @keyframes photoCrossFade {
          0% { opacity:   1; }
          5% { opacity: 0.5; }
        100% { opacity:   1; }
    }
    .photo-inner-frame img.show {
        animation: photoCrossFade 1200ms;
    }

</style>
