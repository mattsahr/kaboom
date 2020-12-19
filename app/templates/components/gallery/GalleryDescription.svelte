<script>
    import { onMount } from 'svelte';
    import Editor from 'cl-editor';
    // import Editor from 'cl-editor/src/Editor.svelte';


    export let updateDescription = () => false;
    export let imgData = {};

    let active = false;
    let editor;

    const actions = ['viewHtml', 'b', 'i', 'u', 'a'];

    const updateDesc = htmlString => {
        updateDescription(imgData.fileName, imgData.title, htmlString);
    };

    const updateTitle = title => {
        updateDescription(imgData.fileName, title, imgData.description);
    };

    $: descHtml = imgData.description || '<em>Click to edit...</em>';
    $: blockClass = 'description-block' + (active ? ' active' : '');

    const activate = () => { 
        active = true; 
    };

    const deactivate = () => { 
        updateDesc(editor.getHtml());
        active = false;   
    };

    /*
    function onTargetClick(e) {
        const html = editTarget.innerHTML;

        console.log('editTarget', editTarget);
        console.log('html', html);

        editTarget.innerHTML = '';
        inlineEditor = new Editor({
            target: editTarget,
            props: {
                actions: ['viewHtml', 'b', 'i', 'u', 'removeFormat', 'a'],
                height: 'auto',
                html: html
            }
        });

        setActive();
    }

    function setActive() {
        editTarget.removeEventListener('click', onTargetClick);

        inlineEditor.on('blur', () => {
            const html = inlineEditor.getHtml();
            inlineEditor.destroy();
            editTarget.innerHTML = html;
            updateDesc(html);
            editTarget.addEventListener('click', onTargetClick);
        });
    }

    const clickListen = () => {
        editTarget.addEventListener('click', onTargetClick);
    };

    onMount(clickListen);
    */

</script>

<!-- ====================================== HTML =============================================== -->


 <div class={blockClass}>
    {#if active}
        <div class="editor-wrapper">
            <Editor {actions} 
                height="100%"
                bind:this={editor} 
                on:blur={deactivate} 
                html={imgData.description} />
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