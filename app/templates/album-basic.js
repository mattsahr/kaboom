import AlbumBasic from './AlbumBasic.svelte';
import GalleryStore from './store/store';

const startApp = galleryData => {

    if (!galleryData) {
        console.error('GalleryData not found');
        return;
    }

    const title = (galleryData.title ? galleryData.title : '') +
        (galleryData.subtitle_A ? ' | ' + galleryData.subtitle_A : '');

    if (title) {
        document.title = title;
        const titleBar = document.querySelector('#headerBar .page-header-title');
        titleBar.innerHTML = title;
    }

    // eslint-disable-next-line no-unused-vars
    const app = new AlbumBasic({
        target: document.getElementById('mainApp'),
        props: {}
    });

    GalleryStore.set(galleryData);

};

window.StartApp = startApp;
