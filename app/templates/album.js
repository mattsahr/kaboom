import Album from './Album.svelte';
import GalleryStore from './store/store';

const hydrateSharedData = galleryData => {
    window.NAV_DATA = window.NAV_DATA || {};
    window.NAV_DATA.currentURL =galleryData.url;
};

const StartApp = galleryData => {

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

    GalleryStore.set(galleryData);
    hydrateSharedData(galleryData);

    // eslint-disable-next-line no-unused-vars
    const app = new Album({
        target: document.getElementById('mainApp'),
        props: {}
    });

};

window.StartApp = StartApp;
