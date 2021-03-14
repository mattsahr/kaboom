<script>
    import { onMount } from 'svelte';
    import { writable } from "svelte/store";
    import { ORPHAN_CATEGORY } from './components/nav/nav-constants';
    import HomeButton from './components/nav/HomeButton.svelte';
    import NavStore from './store/nav-store';
    import NavGroups from './components/nav/NavGroups.svelte';
    import NavList from './components/nav/NavList.svelte';
    import NavItem from './components/nav/NavItem.svelte';
    import ListSwitcher from './components/nav/ListSwitcher.svelte';
    import initModal  from './components/nav/modalize';
    import { 
        composeNavGroups, 
        getList, 
        sortMethods 
    } from './components/nav/nav-helpers';
    import { GALLERY_IS_HOME_PAGE } from './utility/constants';

    const dom = {};
    const active = writable(null);
    const orderType = writable('group');
    const sortDirection = writable('ascending');
    const activeSort = writable(sortMethods.date);

    let current;
    let categories = [];
    const bottomGroup = {};

    const updateMeta = (() => {
        const getMethodName = () => {
            for (const [methodName, method] of Object.entries(sortMethods)) {
                if ($activeSort === method) {
                    return methodName;
                }
            }
            return 'date';
        };

        return () => {
            const update = {
                orderType: $orderType,
                sortDirection: $sortDirection,
                sortMethod: getMethodName()
            };

            NavStore.updateMeta(update);
        };

    })();

    const getSidebarClass = activeState => {
        return 'nav-sidebar' + (activeState ? ' active': '');
    };

    const ACTIVE = window.Network && window.Network.saveNav;

    $: navList = getList($NavStore.albums, $sortDirection, $activeSort, current, $orderType, $active);
    $: noHome = Boolean($NavStore.homeButton === 'none');
    $: atHome = Boolean($NavStore[GALLERY_IS_HOME_PAGE]);
    // $: homeClass =  atHome ? 'current' : '';
    $: currentItem = $NavStore.albums.find(next => next.url === current);
    $: navGroups = composeNavGroups(navList, categories);
    $: sidebarClass = getSidebarClass($active);

    const toggleNav = () => {
        if (!$active) {
            setTimeout(() => { active.set(!$active); }, 10);
        }
    };

    const initOptions = () => {
        current = window.NAV_DATA.currentURL;

        categories = [ ...window.NAV_DATA.categories].sort();
        const orphans = $NavStore.albums
            .filter(next => !next.navCategories || next.navCategories.length === 0);
        if (orphans.length) {
            categories.push(ORPHAN_CATEGORY);
        }

        bottomGroup.category = ($NavStore.bottomLinks || {}).category;
        bottomGroup.links = ($NavStore.bottomLinks || {}).links;

        activeSort.set(sortMethods[$NavStore.sortMethod] || sortMethods.date); 
        orderType.set($NavStore.orderType || 'group');
        sortDirection.set($NavStore.sortDirection || 'ascending');

        console.group('Nav Init!');
        console.log('current', current);
        console.log('categories', categories);
        console.log('NAV-DATA', window.NAV_DATA);
        console.log('$NavStore', $NavStore);
        console.log('$sortDirection', $sortDirection);
        console.log('$active >>', $active);
        console.groupEnd();
    };

    const initNavButton = () => {
        const navButton = document.querySelector("#headerBar .menu-button");
        if (navButton) {
            navButton.addEventListener('click', toggleNav);
        }
        setTimeout(initOptions, 100);
    };

    initModal(dom, 'sidebar', active);
    onMount(initNavButton);

</script>

<!-- ====================================== HTML =============================================== -->


<div class={sidebarClass} bind:this={dom.sidebar}>
    {#if $active}

        <HomeButton />

        {#if !atHome}
            <NavItem custom={{className: 'current'}} item={currentItem} />
        {/if}

        {#if ACTIVE}
            <ListSwitcher 
                {orderType} 
                {sortDirection} 
                {sortMethods} 
                {activeSort}
                {updateMeta} />
        {/if}

        {#if $orderType === 'group'}
            <NavGroups {atHome} {noHome} {navGroups} {bottomGroup} />
        {:else}
            <NavList {atHome} {noHome} {navList} {bottomGroup} />
        {/if}



    {/if}
</div>


<!-- ====================================== STYLES ============================================= -->
<style>

    .nav-sidebar {
        position: fixed;
        z-index: 400;
        top: 0;
        left: 0;
        bottom: 0;
        background: rgb(250, 250, 250);
        box-shadow: 2px 2px 14px rgb(0 0 0 / 20%);
        width: 100%;
        max-width: 266px;
        transform: translate(-310px, 0);
        transition: transform 300ms;
    }

/*    nav-list :global(.accordion-section::last-of-type) {
        border-bottom: solid rgb(200, 200, 200) 1px;
    }
*/

    :global(.nav-list) {
        position: absolute;
        top: 140px;
        right: 0;
        bottom: 0;
        left: 0;
        overflow-y: auto;
        width: 100%;
        padding: 0 0 32px 0;
    }

    :global(.nav-list.at-home) {
        top: 51px;
    }

    :global(.nav-list.no-home) {
        top: 54px;
    }

    .nav-sidebar.active {
        transform: translate(0, 0);
    }


    :global(.menu-button) {
        width: 40px;
        height: 36px;
        position: absolute;
        z-index: 10;
        top: 0;
        left: 6px;
        opacity: 0.6;
        cursor: pointer;
        font-size: 20px;
        border-radius: 3px;
    }
    :global(.menu-button:hover) {
        background-color: rgb(230, 130, 20);
    }
    :global(.menu-button:hover:before) {
        opacity: 0.7;
    }

    :global(.menu-button:before) {
        position: absolute;
        top: 10px;
        left: 12px;
        width: 46%;
        height: 100%;
        transform: scale(1.2, 1);
        content: '';
        background-repeat: no-repeat;
        background-size: contain;
        opacity: 0.3;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAABkCAMAAACCTv/3AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFAAAA5ubmSUUG+gAAAAJ0Uk5T/wDltzBKAAAAPklEQVR42uzYQQ0AAAgDseHfNC4IyVoD912WAACUm3uampqampqamq+aAAD+IVtTU1NTU1NT0z8EAFBsBRgAX+kR+Qam138AAAAASUVORK5CYII=);
    }

</style>

