<script>
    import MdArrowDropUp from 'svelte-icons/md/MdArrowDropUp.svelte';
    import MdArrowDropDown from 'svelte-icons/md/MdArrowDropDown.svelte';

    export let title = undefined;
    export let open = undefined;
    export let className = "";

    $: localClass = 'accordion-section__header' + 
        (open ? ' open' : '') + 
        (className ? ' ' + className : '');

</script>

<div on:click class={localClass}>
    <div class="title">{title}</div>
    {#if open}
        <MdArrowDropUp />
    {:else}
        <MdArrowDropDown />
    {/if}
</div>

<style>
    .accordion-section__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .accordion-section__header :global(svg) {
        width: 22px;
        margin: 0 0 -6px 0;        
    }
</style>

