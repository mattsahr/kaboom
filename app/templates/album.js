import Album from './Album.svelte';
import GalleryStore from './store/store';

const startApp = galleryData => {

    if (!galleryData) {
        console.error('GalleryData not found');
        return;
    }

    if (galleryData && galleryData.title) {
        document.title = galleryData.title;
    }

    // eslint-disable-next-line no-unused-vars
    const app = new Album({
        target: document.body,
        props: {}
    });

    GalleryStore.set(galleryData);
    GalleryStore.loadFullJSON();

};

window.StartApp = startApp;
