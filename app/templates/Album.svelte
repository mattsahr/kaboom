<script>
	// import GalleryStore from './store/store';
	import Lightbox from './components/lightbox/Lightbox.svelte';
	import Column from './components/columns/ColumnDragDrop.svelte';
</script>

<main>
	<Column />
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
