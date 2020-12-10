import Album from './Album.svelte';
import GalleryStore from './store/store';

const startApp = galleryData => {

    if (!galleryData) {
        console.error('GalleryData not found');
        return;
    }

    if (galleryData && galleryData.title) {
        document.title = galleryData.title;
        const titleBar = document.querySelector('#headerBar .page-header-title');
        titleBar.innerHTML = galleryData.title;
    }

    // eslint-disable-next-line no-unused-vars
    const app = new Album({
        target: document.getElementById('mainApp'),
        props: {}
    });

    GalleryStore.set(galleryData);
    GalleryStore.loadFullJSON();

};

window.StartApp = startApp;
