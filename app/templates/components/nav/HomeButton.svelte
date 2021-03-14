<script>
    import NavStore from '../../store/nav-store';
    import NavItem from './NavItem.svelte';
    import { GALLERY_IS_HOME_PAGE } from '../../utility/constants';

    const homeItem = {
        title: 'Home',
        className: 'home', 
        url: '../'
    };

    const activeHome = {
        title: 'Home',
        className: 'home', 
        url: ''
    };

    $: noHome = Boolean($NavStore.homeButton === 'none');
    $: atHome = Boolean($NavStore[GALLERY_IS_HOME_PAGE]);
    $: customHome = ($NavStore.homeButton === 'custom' && $NavStore.homeCustom);
    $: homeClass =  atHome ? 'current' : '';


</script>

<!-- ====================================== HTML =============================================== -->

{#if noHome}
    <div style="height: 4px"></div>
{:else if customHome}
     <NavItem item={$NavStore.homeCustom} bareLink={true} />
{:else}
    <NavItem item={atHome ? activeHome : homeItem} custom={{className: homeClass}}  />
{/if}
