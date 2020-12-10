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

    const loadFullJSON = async () => {
        var handleError = function (err) {
            console.error('Fetch error', err);
            return new window.Response(JSON.stringify({
                code: 400,
                message: 'FETCH ERROR'
            }));
        };

        const req = await (fetch('album-meta-full.json').catch(handleError));

        if (req.status === 200) {
            const fullData = await req.json();

            const updates = fullData.images
                .filter(image => image.dataURI && image.dataURI !== 'noData');

            const allImages = getAllImages();

            for (const source of updates) {
                const target = allImages.find(next => next.fileName === source.fileName);
                if(target) {
                    target.dataURI = source.dataURI;
                }
            }

           updateImages(allImages);
        } else {
            console.log('album-meta-full.json NOT LOADED', req);
        }

    };

    const viewLightbox = fileName => {
        const updated = _cloneDeep(GALLERY);
        updated.current = fileName;
        updated.active = true;

        console.log('STORE', updated);

        set(updated);
    };

    const closeLightbox = () => {
        const updated = _cloneDeep(GALLERY);
        updated.active = false;
        set(updated);
    };

    return {
        updateImages,
        getAllImages,
        loadFullJSON,

        viewLightbox,
        closeLightbox,

        subscribe,
        set,
        update
    };
};

const GalleryStore = createGalleryStore();
export default GalleryStore;
