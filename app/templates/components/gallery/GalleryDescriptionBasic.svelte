<script>
    import AlbumLink from './AlbumLink.svelte';

    export let imgData = {};
    export let isHomePage = false;

    $: descHtml = imgData.description || '';

</script>

<!-- ====================================== HTML =============================================== -->


<div class="description-block">
    <AlbumLink {isHomePage} {imgData} />
    <div class="description">{@html descHtml}</div>
</div>


<!-- ====================================== STYLES ============================================= -->
<style>
    .description-block {
        padding: 0 20px 0 0;
        font-size: 13px;
        line-height: 1.7;
        color: #505050;
        text-align: left;
        vertical-align: top;
        width: 280px;
        flex: 1 1 auto;
        z-index: 20;
    }

    @media all and (max-width: 800px) {
        .description-block {
            width: 200px;
        }
    }

     @media all and (max-width: 599px) {
        .description-block {
            padding: 4px 0 12px 2px;
            width: 100%;
            margin: 0 30px 0 0;
        }
    }

</style>