<script>
    export let hideItem;
    export let deleteItem;
    export let imgData;
    export let setPromo;
    export let isHomePage = false;
    import HideButton from '../buttons/HideButton.svelte';
    import DeleteButton from '../buttons/DeleteButton.svelte';
    import PromoButton from '../buttons/PromoButton.svelte';
    import MdClose from 'svelte-icons/md/MdClose.svelte';
    import MdSettings from 'svelte-icons/md/MdSettings.svelte';

    let active = false

    $: settingsClass = 'settings' + (active ? ' active' : active);

    const onClick = () => {
        console.log('click!');
        active = !active;
    }
</script>

<div class="settings">
    <div class="button" on:click={onClick}>
        {#if active}<MdClose />{:else}<MdSettings />{/if}
    </div>
    {#if active && !isHomePage} 
        <PromoButton {setPromo} {imgData} />
    {/if}
    {#if active} 
        <DeleteButton {deleteItem} {imgData} />
    {/if}
    {#if active} 
        <HideButton {hideItem} {imgData} />
    {/if}
</div>

<style>
    .settings {
        position: absolute;
        bottom: 0;
        right: 0px;
    }

    .button {
        position: absolute;
        bottom: 0;
        right: 0px;
        height: 24px;
        width: 54px;
        border-radius: 4px 0 0 0;
        border: solid rgb(210, 220, 230);
        border-width: 1px 0 0 1px;
        text-transform: uppercase;
        text-align: center;
        padding: 3px 0 3px 0;
        color: rgb(170, 180, 210);
        cursor: pointer;
        opacity: 0.7;
        z-index: 20;
    }

    .button:hover {
        opacity: 1;
        background-color: white;
    }

</style>