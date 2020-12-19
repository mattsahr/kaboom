<script>
	import Lightbox from './components/lightbox/Lightbox.svelte';
	import ColumnBasic from './components/columns/ColumnBasic.svelte';
</script>

<main>
	<ColumnBasic />
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
