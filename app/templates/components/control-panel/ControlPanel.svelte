<script>
    import { fly } from 'svelte/transition';
    import MdList from 'svelte-icons/md/MdList.svelte';
    import GalleryStore from '../../store/store';
    import Flatpickr from 'svelte-flatpickr/src/Flatpickr.svelte';
    import Tags from "svelte-tags-input";
    import Toggle from './Toggle.svelte';

    window.NAV_DATA = window.NAV_DATA || {};
    window.NAV_DATA.categories = window.NAV_DATA.categories || [
        'Africa',
        'Americas',
        'Asia',
        'Europe',
        'Middle East',
        'Southeast Asia'
    ];

    const flyAnimation = { y: -200, duration: 550 };

    const dummyArray = [];
    const onToggle = () => {
        GalleryStore.toggleControlPanel();
    };

    const getDate = store => {
        const date = store.date;
        if (flatpickr) { 
            flatpickr.setDate(dateValue); 
        }
        return date;
    };

    const refreshCategories = store => {
        if (!store.navCategories && !window.NAV_DATA) {
            return dummyArray;
        }

        return [ 
            ...(store.navCategories || dummyArray),
            ...(window.NAV_DATA ? window.NAV_DATA.categories : dummyArray) 
        ];
    };

    const refreshOpen = store => {
        if (!store.controlPanelOpen) {
            flatpickr = undefined;
        }
        return store.controlPanelOpen;
    };

    let dValue, formattedValue, flatpickr;

    $: open = refreshOpen($GalleryStore);
    $: controlPanelClass = 'control-panel' + (open ? ' open' : '');
    $: dateValue = getDate($GalleryStore);
    $: navCategories = $GalleryStore.navCategories || [];
    $: masterCategories = refreshCategories($GalleryStore);

    const flatpickrOptions = {
        dateFormat: 'Y M d',
        onChange(selectedDates, dateStr) {
            dateValue = dateStr;
            onPanelBlur();
        },
        onReady: () => { setTimeout(() => flatpickr.setDate(dateValue), 100); }
    };
    
    const changeTags = event => {
        let tags = event.detail.tags;
        tags = tags.toString().split(',').map(d => d.trim());
        navCategories = tags;
        onPanelBlur();
    };

    /*
    const onToggleChange = e => {
        console.log('onToggleChange!', e);
        // $GalleryStore.restrictDownloads = !$GalleryStore.restrictDownloads;
    };
    */

    const onPanelBlur = () => {
        GalleryStore.updateMeta({ date: dateValue, navCategories });
    };

</script>

<!-- ====================================== HTML =============================================== -->


<div class="panel-toggle" on:click={onToggle}><MdList /></div>

<div class={controlPanelClass}>
    {#if open}
        <div class="control-panel-frame" in:fly={flyAnimation} out:fly={flyAnimation}>

            <div class="entry-block">
                <label for="gallery-title">Title</label>
                <input id="gallery-title" on:blur={onPanelBlur} 
                    bind:value={$GalleryStore.title}>
            </div>

            <div class="entry-block">
                <label for="gallery-subtitle_A">Subtitle A</label>
                <input id="gallery-subtitle_A" on:blur={onPanelBlur} 
                    bind:value={$GalleryStore.subtitle_A}>
            </div>

            <div class="entry-block">
                <label for="gallery-date">Date</label>
                <Flatpickr name="date" 
                    options={flatpickrOptions}
                    bind:value={dValue}
                    bind:formattedValue 
                    bind:flatpickr />
            </div>

            <div class="entry-block">
                <label for="gallery-subtitle_B">Subtitle B</label>
                <input id="gallery-subtitle_B" on:blur={onPanelBlur} 
                    bind:value={$GalleryStore.subtitle_B}>
            </div>


            <div class="entry-block wide">
                <label for="allowDownloads">Photo Downloads</label>
                <Toggle bind:checked={$GalleryStore.allowDownloads} 
                    onLabel="Enabled" offLabel="Disabled" name="allowDownloads" />
            </div>


            <div class="entry-block double">
                 <label for="gallery-nav-categories">Nav Categories</label>
                 <Tags tags={navCategories} autoComplete={masterCategories} on:tags={changeTags} />
            </div>

        </div>
    {/if}
</div>


<!-- ====================================== STYLES ============================================= -->
<style>
    .panel-toggle {
        top: 2px;
        right: 42px;
        height: 32px;
        width: 32px;
        position: fixed;
        z-index: 400;
        padding: 0;
        color: rgb(190, 190, 190);
        border: solid rgb(200, 200, 200);
        border-width: 2px;
        cursor: pointer;
        border-radius: 4px;
    }
    .panel-toggle:hover {
        background-color: rgb(240, 240, 240);
    }

    .control-panel {
        margin: -38px auto 10px auto;
        padding: 0;
        max-width: 1060px;
        width: 100%;
        overflow: hidden;
        border-radius: 3px;
        background: rgb(226, 224, 220);
        border: solid 1px transparent;
        transition: opacity 500ms, height 500ms;
        height: 0;
        opacity: 0;
        position: relative;
        z-index: 40;
    }

    .control-panel.open {
        height: 250px;
        opacity: 1;
        border-color: rgb(200, 200, 200);
        overflow: visible;
    }


    .control-panel-frame {
        padding: 30px 0 0 0;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        margin: 0 auto;
        max-width: 660px;
    }


    .entry-block {
        width: 300px;
        font-size: 13px;
        display: flex;
        justify-content: flex-end;
        margin: 0 0 16px 0;
    }

    .entry-block.wide {
        width: 100%;
        max-width: 550px;
        margin: 2px 0 0 0;
    }

    .entry-block :global(.toggle) {
        width: 130px;
    }

    .entry-block.double {
        width: 100%;
        max-width: 550px;
        display: block;
        margin: 0 -48px 0 0;
    }

    label {
        margin: 6px 8px 0 0;
        font-weight: bold;
        color: rgb(20, 60, 120);
        letter-spacing: 0.03em;
        display: inline-block;
    }

    .entry-block.double label {
        margin: 0 0 0 10px;
    }

    .entry-block :global(input) {
        font-size: 14px;
        padding: 6px 5px;
        height: 20px;
        border: solid 1px rgb(200, 200, 200);
        width: calc(100% - 108px);
    }

    .entry-block :global(.svelte-tags-input-layout) {
        width: 100%;
    }

    .entry-block :global(.svelte-tags-input-tag.svelte-tags-input-tag) {
        background: rgb(200, 230, 230);
        color: rgb(0, 10, 30);
    }

    .entry-block :global(.svelte-tags-input-tag-remove) {
        padding: 0 2px 0 6px;
    }


    @media all and (min-width: 1080px) {
        .panel-toggle {
            right: 50%;
            margin-right: -480px;
        }
    }

    @media all and (max-width: 618px) {
        .control-panel.open {
            height: 340px;
        }

        .entry-block.double {
            margin: 0;
        }
    }

</style>