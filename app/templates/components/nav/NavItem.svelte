<script>
    export let item = {};
    export let custom = {};
    export let bareLink = false;

    const getRoot = () => (window.NAV_DATA && window.NAV_DATA.NAV_ROOT) || '../';

    $: link = custom.noLink 
        ? ''
        : bareLink
            ? item.url
            : custom.url || (getRoot() + item.url);
    
</script>

<!-- ====================================== HTML =============================================== -->

<a class={'nav-item' + (custom.className ? ' ' + custom.className : '')}
    href={link}
    title={custom.title ? custom.title : '/' + item.url}>

    <div class="nav-title">{custom.title || item.title}</div>

    {#if item.subtitle_A}
        <div class="nav-subtitle A">{item.subtitle_A}</div>
    {/if}

    {#if item.subtitle_B}
        <div class="nav-subtitle B">{item.subtitle_B}</div>
    {/if}

</a>


<!-- ====================================== STYLES ============================================= -->
<style>

    .nav-item {
        padding: 14px 18px 18px 18px;
        line-height: 1.4;
        font-size: 14px;
        cursor: pointer;
        border: solid rgb(230, 230, 230);
        border-width: 1px 0 0 0;
        display: block;
        text-decoration: none;
        color: rgb(40, 40, 40);
    }

    .nav-item:hover {
        background-color: rgb(240, 240, 240);
    }

    .nav-item.current, .nav-item-current:hover {
        cursor: default;
        background: rgb(255, 255, 255);
        padding: 14px 18px 18px 12px;
        border-bottom-width: 1px;
        border-left: solid 6px rgb(0, 255, 0);
        pointer-events: none;
    }

    .nav-title {
        font-weight: bold;
        line-height: 1.3;
        color: rgb(80, 90, 100);
    }

    .nav-item:hover .nav-title {
        color: rgb(50, 110, 150);
    }

</style>
