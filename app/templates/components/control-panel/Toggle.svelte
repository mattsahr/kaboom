<script>
    export let checked = false;
    export let name= "toggle";
    export let onLabel = null;
    export let offLabel = null;
    export let checkedColor = '#bbe572';

</script>

<!-- ====================================== HTML =============================================== -->

<div class="toggle">
    <label class="toggle-label">
        <input class="toggle-input" {name} type="checkbox" bind:checked on:change >
        <span class="toggle-track" style={checked ? `background-color: ${checkedColor};` : ''}>
            <span class="toggle-switch"></span>
        </span>
        {#if onLabel && offLabel}
            <span class="toggle-title">{checked ? onLabel : offLabel}</span>
        {/if}
    </label>
</div>


<!-- ====================================== STYLES ============================================= -->
<style>
    .toggle {
        position: relative;
        padding: 6px 0 0 12px;
        font-size: 13px;
    }

    .toggle-input {
        border: 0;
        clip: rect(0 0 0 0);
        height: auto;
        margin: 0;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
        white-space: nowrap;
    }

    .toggle-label {
    cursor: pointer;
    position: relative;
    }

    .toggle-label, .toggle-title, .toggle-track, .toggle-switch {
    display: inline-block;
    vertical-align: middle;
    }

    .toggle-track {
        position: relative;
        top: -0.125em;
        width: 3.5em;
        height: 1.9em;
        background-color: #eee;
        border: 0.0625em solid rgba(0, 0, 0, 0.15);
        border-radius: 5px;
        transition: 0.35s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        transition-property: background-color, border-color;
    }

    .toggle-label .toggle-input:checked ~ .toggle-track {
        border-color: rgba(0, 0, 0, 0.05);
    }

    .toggle-track + .toggle-title {
        margin-left: 0.375em;
        margin-top: -4px;
    }

    .toggle-switch {
        position: absolute;
        top: 0;
        right: 1em;
        bottom: 0;
        left: 0;
        margin: 2px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.8);
        transition: 0.35s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        transition-property: left, right;
        transition-delay: 0s, 0.05s;
    }

    .toggle-label:active .toggle-switch {
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.8), inset 1px 1px 6px rgba(0, 0, 0, 0.1);
    }

    .toggle-label .toggle-input:checked ~ .toggle-track > .toggle-switch {
        right: 0;
        left: 0.9375em;
        transition: 0.35s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        transition-property: left, right;
        transition-delay: 0.05s, 0s;
    }
</style>