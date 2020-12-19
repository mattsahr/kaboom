<script>
    import { fade } from 'svelte/transition';
    import Accordion from '../accordion/accordion.js';
    import NavItem from './NavItem.svelte';

    const custom = {};
    export let navGroups;
</script>


<div class="nav-list" in:fade out:fade >
    <Accordion>
        {#each navGroups as group(group.category)}
            <Accordion.Section title={group.category}>
                {#each group.items as item(item.url)}
                    <NavItem {item} {custom} />
                {/each}
                </Accordion.Section>
        {/each}
    </Accordion>
</div>

<style>

    :global(.nav-list ul.accordion) {
        padding: 0;
        margin: 0;
        list-style: none;
        background: rgb(248, 244, 240);
    }

    :global(.nav-list .accordion-section__header) {
        border: solid rgb(200, 200, 200);
        border-width: 1px 0 0 0;
        background: rgb(250, 250, 250);
        color: rgb(120, 120, 120);
        font-size: 16px;
        height: 56px;
        padding: 12px 8px 4px 16px;
        cursor: pointer;
    }

    :global(.nav-list .accordion-body) {
        border: solid rgb(200, 120, 70);
        border-width: 0 0 1px 0;
    }

    :global(.nav-list  li:last-of-type .accordion-section__header) {
        border-bottom-width: 1px;
    }

    :global(.nav-list .accordion-section__header svg) {
        pointer-events: none;
    }

    :global(.nav-list .accordion-section__header.open,
            .nav-list  li:last-of-type .accordion-section__header.open) {
        color: rgb(40, 40, 40);
        border-bottom-color: rgb(210, 130, 60);
        border-bottom-width: 3px;
        background: rgb(255, 255, 255);
        padding-bottom: 2px;
    }

</style>
