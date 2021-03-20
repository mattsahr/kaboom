<script>
    import MdChevronRight from 'svelte-icons/md/MdChevronRight.svelte';

    export let isHomePage = false;
    export let imgData;

    if (isHomePage) {
        console.log('imgData', imgData);
    }

</script>

<!-- ====================================== HTML ============================================= -->

{#if isHomePage && imgData.url}
    <div class="album-details">
        <a href={imgData.url}>
            <div class="title">{imgData.title}</div>
            <div class="icon"><MdChevronRight /></div>
        </a>
        {#if imgData.subtitle_A}<div class="subtitle A">{imgData.subtitle_A}</div>{/if}
        {#if imgData.subtitle_B}<div class="subtitle B">{imgData.subtitle_B}</div>{/if}
    </div>
{/if}

<!-- ====================================== STYLES =========================================== -->

<style>

    .album-details {
        min-height: 52px;
        margin: 0 -12px 12px -12px;
        border: solid rgb(200, 200, 200);
        border-width: 0 0 1px 0;
    }

    .album-details a {
        text-decoration: none;
        font-weight: bold;
        color: rgb(120, 140, 160);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 8px 8px 12px;
        margin: 0;
        border-radius: 4px;
        cursor: pointer;
    }

    .album-details a:hover {
        color: rgb(40, 140, 160);
        background: rgb(236, 240, 242);
    }

    .icon {
        height: 22px;
        width: 40px;
        padding: 0 0 0 8px;
    }

    .subtitle {
        padding: 8px 8px 8px 12px;
    }

</style>