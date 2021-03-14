<script>
    import { fly } from 'svelte/transition';
    export let setPromo;
    export let imgData;
    const onClick = () => {
        setPromo(imgData.fileName);
    };

    $: promoClass = 'promo-button' + (imgData.isPromo ? ' is-promo' : '');

</script>

<div class={promoClass} 
    in:fly="{{ x: 200, duration: 250 }}" 
    out:fly="{{ x: 200, duration: 250 }}"
    on:click={onClick}>
    Promo
</div>

<style>
    .promo-button {
        position: absolute;
        bottom: 0;
        right: 162px;
        height: 24px;
        width: 54px;
        border-radius: 4px 4px 0 0;
        border: solid rgb(210, 220, 230);
        border-width: 1px 1px 0 1px;
        text-transform: uppercase;
        font-size: 10px;
        text-align: center;
        padding: 3px 0 0 0;
        letter-spacing: 0.05em;
        cursor: pointer;
        opacity: 0.7;
    }

    .promo-button.is-promo { 
        background-color: rgb(255, 220, 100);
        border-color: rgb(190, 150, 80);
        color: rgb(60, 40, 0);
        opacity: 0.9;
    }


    .promo-button:hover {
        opacity: 1;
        background-color: white;
    }
</style>