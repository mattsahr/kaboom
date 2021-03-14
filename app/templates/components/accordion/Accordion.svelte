<script>
    import { createEventDispatcher, setContext } from "svelte";
    import { writable } from "svelte/store";
    import { ACCORDION } from "./AccordionSection.svelte";

    const selected = writable(null);

    export let value = undefined;
    export let className = '';
    const dispatch = createEventDispatcher();
    let currentValue = '';

    $: isControlled = typeof(value) !== "undefined";

    $: if (isControlled) {
        selected.set(value);
    }

    const handleChange = function(newValue) {
        
        if (!isControlled) {
            if (newValue === $selected) {
                selected.set('');    
            } else {
                selected.set(newValue);    
            }
        }

        if (newValue === currentValue) {
            currentValue = '';
            dispatch('change', '');
        } else {
            dispatch('change', newValue);    
        }        
    };

    setContext(
        ACCORDION, 
        {
            handleChange,
            selected
        }
    );

</script>

<style>
    .accordion {
        list-style: none;
    }
</style>

<ul class={`accordion ${className}`}>
    <slot />
</ul>
