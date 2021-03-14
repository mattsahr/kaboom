<script>
    import { fade } from 'svelte/transition';
    import NavItem from './NavItem.svelte';

    const custom = {};
    export let navList;
    export let atHome;
    export let noHome;
    export let bottomGroup;

    $: listClass = 'nav-list' + (atHome ? ' at-home' : '') + (noHome ? ' no-home' : '');
    $: bottomLinks = bottomGroup.links && bottomGroup.links.length
        ? bottomGroup.links
        : null;

</script>

<div class={listClass} in:fade out:fade >

    {#each navList as item(item.url)}
        <NavItem {item} {custom} />
    {/each}
    {#if bottomLinks}
        {#each bottomLinks as item(item.url)}
            <NavItem {item} {custom} bareLink={true}  />
        {/each}
    {/if}

</div>
