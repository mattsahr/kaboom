import _cloneDeep from 'lodash/cloneDeep';
import { writable } from 'svelte/store';

const createGalleryStore = () => {
    const { subscribe, set, update } = writable ({
        title: 'ALBUM',
        images: []
    });

    let GALLERY;
    subscribe(gallery => GALLERY = gallery);

    const save = () => {
        setTimeout(() => {
            if (window.Network && window.Network.save) {
                window.Network.save(GALLERY);
            }
        }, 50);
    };

    const updateImages = imageBatch => {
        const updated = _cloneDeep(GALLERY);
        updated.images = imageBatch;
        set(updated); save();
    };

    const getAllImages = () => _cloneDeep(GALLERY.images);

    const addImages = extraGallery => {
        const updated = _cloneDeep(GALLERY);

        for (const image of extraGallery.images) {
            if (!updated.images.find(next => next.fileName === image.fileName)) {

                image.id = image.fileName;
                image.svgSequence = extraGallery.svgSequences[image.fileName];

                updated.svgSequences[image.fileName] = extraGallery.svgSequences[image.fileName];

                updated.images.push(image);
            }
        }

        console.log('UPDATED ADD IMAGES', updated);
        set(updated);
    };

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

        set(updated); save();
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
        set(updated); save();
    };

    const hide = fileName => {
        const updated = { ...GALLERY };
        const toHide = GALLERY.images.find(image => image.fileName === fileName);
        updated.images = GALLERY.images.filter(image => image.fileName !== fileName);

        toHide.hidden = true;
        updated.images.push(toHide);

        set(updated); save();
    };

    const unhide = fileName => {
        const updated = { ...GALLERY };
        const toReveal = GALLERY.images.find(image => image.fileName === fileName);
        updated.images = GALLERY.images.filter(image => image.fileName !== fileName);

        toReveal.hidden = false;
        updated.images.unshift(toReveal);

        set(updated); save();
    };

    return {
        updateImages,
        getAllImages,

        viewLightbox,
        closeLightbox,
        toggleControlPanel,

        addImages,

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
