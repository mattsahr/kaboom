import _cloneDeep from 'lodash/cloneDeep';
import { writable } from 'svelte/store';

export const hydrateSvgSequence = (() => {
    const dummySequence = ['#ef5c08,0.945,133,110,220,161'];
    const explode = str => {
        if (str[0] === '#') { return str.split(','); }

        const [color, xyRxRy] = str.split('|');
        const oval = xyRxRy.split(',');
        oval.unshift('0.4');
        oval.unshift('#' + color);

        return oval;
    };
    return seq => (seq || dummySequence).map(explode);
})(); 


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

            window.GALLERY = GALLERY;
        }, 30);
    };

    const saveDeletion = (fileName) => {
        setTimeout(() => {
            if (window.Network && window.Network.deleteImage) {
                window.Network.deleteImage(fileName);
            }
        }, 60);
    };

    const stampTime = obj => {
        obj.lastUpdate = Date.now();
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
                image.svgSequence = hydrateSvgSequence(extraGallery.svgSequences[image.fileName]);

                updated.svgSequences[image.fileName] = extraGallery.svgSequences[image.fileName];

                updated.images.push(image);
            }
        }

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
        stampTime(image);
        stampTime(updated);

        set(updated); save();
    };

    const updatePromoDescription = (fileName, title, htmlString) => {
        const updated = _cloneDeep(GALLERY);
        const image = updated.images.find(next => next.fileName === fileName);

        image.promoDescription = htmlString;
        image.title = title || '';
        updated.promo.promoDescription = image.promoDescription;
        updated.promo.title = image.title;

        stampTime(image);
        stampTime(updated.promo);
        stampTime(updated);

        set(updated); save();
    };

    const setPromo = fileName => {
        const updated = _cloneDeep(GALLERY);
        for (const item of updated.images) {
            if (item.fileName === fileName) {

                stampTime(item);

                if (item.isPromo) {
                    delete item.isPromo;
                    delete updated.promo;
                } else {
                    item.isPromo = true;
                    updated.promo = _cloneDeep(item);
                    stampTime(updated.promo);
                }
            } else {
                delete item.isPromo;
            }
        }

        stampTime(updated);
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
        stampTime(updated);
        set(updated); save();
    };

    const hide = fileName => {
        const updated = { ...GALLERY };
        const toHide = GALLERY.images.find(image => image.fileName === fileName);
        updated.images = GALLERY.images.filter(image => image.fileName !== fileName);

        toHide.hidden = true;
        updated.images.push(toHide);

        stampTime(toHide);
        stampTime(updated);
        set(updated); save();
    };

    const unhide = fileName => {
        const updated = { ...GALLERY };
        const toReveal = GALLERY.images.find(image => image.fileName === fileName);
        updated.images = GALLERY.images.filter(image => image.fileName !== fileName);

        toReveal.hidden = false;
        updated.images.unshift(toReveal);

        stampTime(toReveal);
        stampTime(updated);
        set(updated); save();
    };

    const deleteImage = fileName => {
        const updated = { ...GALLERY };
        updated.images = GALLERY.images.filter(image => image.fileName !== fileName);
        stampTime(updated);
        set(updated); 
        save();
        saveDeletion(fileName);
    };

    return {
        updateImages,
        getAllImages,

        viewLightbox,
        closeLightbox,
        toggleControlPanel,

        addImages,

        updateDescription,
        updatePromoDescription,
        updateMeta,
        setPromo,

        hide,
        unhide,
        deleteImage,

        subscribe,
        set,
        update
    };
};

const GalleryStore = createGalleryStore();
export default GalleryStore;
