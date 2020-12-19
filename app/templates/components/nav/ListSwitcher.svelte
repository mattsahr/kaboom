<script>
    import { fly } from 'svelte/transition';
    import MdArrowDropDown from 'svelte-icons/md/MdArrowDropDown.svelte';
    import MdArrowDropUp from 'svelte-icons/md/MdArrowDropUp.svelte';
    import MdBrightnessLow from 'svelte-icons/md/MdBrightnessLow.svelte';
    import MdClose from 'svelte-icons/md/MdClose.svelte';
    import MdAdjust from 'svelte-icons/md/MdAdjust.svelte';
    import modalize from './modalize';

    export let orderType;
    export let sortDirection;
    export let showSwitcher;
    export let sortMethods = {};
    export let activeSort;
    export let updateMeta = () => false;

    let switcherEl;
    let switcherListener;


    const toggleSwitcher = () => {
        showSwitcher.set(true);
        setTimeout(() => {
            switcherListener = modalize(switcherEl, showSwitcher, switcherListener);
        }, 50);
    };

    const closeSwitcher = () => {
        modalize(null, null, switcherListener);
        showSwitcher.set(false);
    };

    const toggleGroup = () => {
        orderType.set('group');
        updateMeta();
    };

    const toggleSort = () => {
        if ($orderType === 'listing') {
            if ($sortDirection === 'ascending') {
                sortDirection.set('descending');
            } else {
                sortDirection.set('ascending');
            }
        }
        orderType.set('listing');
        updateMeta();
    };

    const toggleSortType = event => {
        const sortType = event.currentTarget.dataset.sortType;
        if ($activeSort !== sortMethods[sortType]) {
            activeSort.set(sortMethods[sortType]);
        }
        updateMeta();
    };

    const getSortClass = (type, active) => 
        'switch-option sort-type' + (active === sortMethods[type] ? ' active' : '');

</script>

<!-- ====================================== HTML =============================================== -->


<div class="switcher-bug" on:click={toggleSwitcher}><MdBrightnessLow /></div>
{#if $showSwitcher}
    <div class="list-switcher" transition:fly={{ y: -150, duration: 400 }} bind:this={switcherEl}>

            <div class="close-me" on:click={closeSwitcher}><MdClose /></div>

            <div class="switch-title">Nav Display</div>

            <div on:click={toggleGroup} 
                class={'switch-option group' + ($orderType === 'group' ? ' active' : '')}>
                <div class="text">Group</div>
                <MdAdjust />
            </div>
            <div on:click={toggleSort} 
                class={'switch-option sort' + ($orderType !== 'group' ? ' active' : '')}>
                <div class="text">List</div>
                {#if $sortDirection === 'ascending'}
                    <MdArrowDropDown />
                {:else}
                    <MdArrowDropUp />
                {/if}
            </div>

            <div class="switch-title">Sort By</div>

            <div on:click={toggleSortType} data-sort-type="date" 
                class={getSortClass('date', $activeSort)} >
                <div class="text">Date</div>
            </div>

            <div on:click={toggleSortType} data-sort-type="title" 
                class={getSortClass('title', $activeSort)} >
                <div class="text">Title</div>
            </div>

            <div on:click={toggleSortType} data-sort-type="url" 
                class={getSortClass('url', $activeSort)} >
                <div class="text">URL</div>
            </div>

            <div class="switch-spacer"> </div>


    </div>
{/if}


<!-- ====================================== STYLES ============================================= -->
<style>
    .switcher-bug, .close-me {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 20;
        width: 48px;
        height: 50px;
        padding: 14px 6px 14px 8px;
        color: rgb(160, 200, 180);
        cursor: pointer;
        border-radius: 36px;
    }

    .close-me {
        padding: 4px 4px 4px 4px;
        top: 2px;
        right: 4px;
        width: 32px;
        height: 32px;
    }

    .switcher-bug:hover, .close-me:hover {
        background-color: white;
        color: rgb(100, 180, 150);
    }

    :global(.switcher-bug svg, .close-me svg) {
        pointer-events: none;
    }

    .list-switcher {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        box-shadow: 2px 2px 24px rgba(0, 0, 0, 0.5);
        z-index: 40;
        background-color: rgb(240, 240, 240);
        margin: 0;
        border: solid rgb(200, 200, 200);
        border-width: 1px 0 1px 0;
        display: flex;
        flex-wrap: wrap;
    }

    .switch-title {
        width: 100%;
        text-align: center;
        text-transform: uppercase;
        position: relative;
        height: 36px;
        padding: 10px 0 0 0;
        border: solid rgb(200, 200, 200);
        border-width: 1px 0 1px 0;
    }

    .switch-spacer {
        width: 100%;
        height: 20px;
        border: solid rgb(200, 200, 200);
        border-width: 1px 0 0 0;
    }


    .switch-option {
        width: 50%;
        padding: 0 16px 0 16px;
        height: 46px;
        display: flex;
        font-size: 12px;
        text-transform: uppercase;
        justify-content: space-around;
        align-items: center;
        color: rgb(150, 150, 150);
        cursor: pointer;
    }

    .switch-option.sort-type {
        width: 33%;
        border-right: solid 1px rgb(200, 200, 200);
        flex-grow: 2;        
    }

    .switch-option.sort-type::last-of-type {
        border-right-width: 0;
    }

    .switch-option:hover {
        color: rgb(0, 0, 0);
    }

    .switch-option.group :global(svg) {
        transform: scale(0.8);
        color: greenyellow;
    }

    .switch-option:first-of-type {
        border-right: solid 1px rgb(200, 200, 200);
    }

    .switch-option.active {
        background-color: rgb(255, 255, 255);
    }

    .switch-option :global(svg) {
        display: block;
        height: 22px;
        width: 22px;
        opacity: 0;
        pointer-events: none;
    }

    .switch-option.active :global(svg),
    .switch-option.sort :global(svg) {
        opacity: 1;
    }


</style>