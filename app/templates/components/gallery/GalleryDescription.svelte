<script>
    import Editor from 'cl-editor';

    export let updateDescription = () => false;
    export let isPromo = false;
    export let imgData = {};

    let active = false;
    let editor;

    const actions = ['viewHtml', 'b', 'i', 'u', 'a'];

    const updateDesc = htmlString => {
        updateDescription(imgData.fileName, imgData.title, htmlString);
    };

    $: descHtml = isPromo
        ? imgData.promoDescription || imgData.description || '<em>Click to edit...</em>'
        : imgData.description || '<em>Click to edit...</em>';

    $: desc = isPromo
        ? imgData.promoDescription || imgData.description
        : imgData.description;

    $: blockClass = 'description-block' + 
        (active ? ' active' : '') +
        (isPromo ? ' promo' : '');

    const activate = () => { 
        active = true; 
    };

    const deactivate = () => { 
        updateDesc(editor.getHtml());
        active = false;   
    };


</script>

<!-- ====================================== HTML =============================================== -->


 <div class={blockClass}>
    {#if active}
        <div class="editor-wrapper">
            <Editor {actions} 
                height="100%"
                bind:this={editor} 
                on:blur={deactivate} 
                html={desc} />
        </div>
    {:else}
        <div class="description" on:click={activate}>{@html descHtml}</div>
    {/if}
</div>


<!-- ====================================== STYLES ============================================= -->
<style>
    .description-block {
        padding: 0 20px 0 0;
        font-size: 13px;
        line-height: 1.7;
        color: #505050;
        text-align: left;
        vertical-align: top;
        width: 280px;
        flex: 1 1 auto;
        z-index: 20;
    }


    .description-block.promo {
        width: 100%;
        padding: 0 0 16px 16px;
        margin-top: -36px;
        height: calc(100% - 54px);
     }

     .description-block.promo .description {
        overflow-y: auto;
        max-height: 100%;
        padding-right: 16px;
    }

    .editor-wrapper {
        margin: -36px -16px 0 -100px;
        height: 100%;
    }

    @media all and (max-width: 800px) {
        .description-block {
            width: 200px;
        }
    }

     @media all and (max-width: 599px) {
        .description-block {
            padding: 4px 0 12px 2px;
            width: 100%;
            margin: 0 30px 0 0;
        }

        .editor-wrapper {
            margin: -46px 0 -10px 0;
        }

    }

</style>