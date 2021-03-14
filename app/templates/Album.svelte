<script>
	import Lightbox from './components/lightbox/Lightbox.svelte';
	import ControlPanel from './components/control-panel/ControlPanel.svelte';
	import Column from './components/columns/ColumnDragDrop.svelte';
    import Modal from 'svelte-simple-modal';
</script>

<main>
	<ControlPanel />
	<Modal>
		<Column />
	</Modal>
	<Lightbox />
</main>

<style>
	main {
	    padding: 72px 0 0 0;
	}

    @media all and (max-width: 599px) {
		main {
		    padding: 56px 0 0 0;
		}
	}
</style>
