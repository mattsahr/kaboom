<script context="module">
    export const ACCORDION = {};
</script>

<script>
    import { getContext } from "svelte";
    import { slide } from "svelte/transition";
    import Header from "./AccordionHeader.svelte";

    export let title = undefined;
    export let open = false;
    export let className = "";
    export let key;

    $: key = key || title;

    const { handleChange, selected } = getContext(ACCORDION);
    //get selected value from context
    $: open = $selected === key;
</script>

<li class={`accordion-section ${className}`}>
    <Header on:click={handleChange.bind(null, key)} {title} {open} />
    {#if open}
        <div class="accordion-body" transition:slide>
            <slot />
        </div>
    {/if}
</li>
