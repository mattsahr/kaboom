<script>
    import { fade } from 'svelte/transition';
    import NavItem from './NavItem.svelte';

    const custom = {};
    export let navList;
</script>

<div class="nav-list" in:fade out:fade >

    {#each navList as item(item.url)}
        <NavItem {item} {custom} />
    {/each}

</div>
