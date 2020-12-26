import _cloneDeep from 'lodash/cloneDeep';
import { writable } from 'svelte/store';

const createGalleryStore = () => {
    const { subscribe, set, update } = writable ({
        title: 'ALBUM',
        images: []
    });

    let GALLERY;
    subscribe(gallery => GALLERY = gallery);

    const updateImages = imageBatch => {
        const updated = _cloneDeep(GALLERY);
        updated.images = imageBatch;
        set(updated);
    };

    const getAllImages = () => _cloneDeep(GALLERY.images);


    const viewLightbox = fileName => {
        const updated = _cloneDeep(GALLERY);
        updated.current = fileName;
        updated.active = true;

        console.log('STORE', updated);

        set(updated);
    };

    const updateDescription = (fileName, title, htmlString) => {
        const updated = _cloneDeep(GALLERY);
        const image = updated.images.find(next => next.fileName === fileName);

        image.description = htmlString;
        image.title = title || '';

        set(updated);
    };

    const closeLightbox = () => {
        const updated = _cloneDeep(GALLERY);
        updated.active = false;
        set(updated);
    };

    const toggleControlPanel = () => {
        const updated = _cloneDeep(GALLERY);
        updated.controlPanelOpen = !updated.controlPanelOpen;
        set(updated);
    };

    const updateMeta = updates => {
        const updated = {
            ...GALLERY,
            ...updates
        };
        set(updated);
        console.log('STORE updateMeta', updated);
    };

    const hide = fileName => {
        const updated = { ...GALLERY };
        const toHide = GALLERY.images.find(image => image.fileName === fileName);
        updated.images = GALLERY.images.filter(image => image.fileName !== fileName);

        toHide.hidden = true;
        updated.images.push(toHide);

        set(updated);
    };

    const unhide = fileName => {
        const updated = { ...GALLERY };
        const toReveal = GALLERY.images.find(image => image.fileName === fileName);
        updated.images = GALLERY.images.filter(image => image.fileName !== fileName);

        toReveal.hidden = false;
        updated.images.unshift(toReveal);

        set(updated);
    };

    return {
        updateImages,
        getAllImages,

        viewLightbox,
        closeLightbox,
        toggleControlPanel,

        updateDescription,
        updateMeta,

        hide,
        unhide,

        subscribe,
        set,
        update
    };
};

const GalleryStore = createGalleryStore();
export default GalleryStore;
