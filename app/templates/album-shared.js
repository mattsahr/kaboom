import GalleryStore from './store/store';
import { GALLERY_IS_HOME_PAGE } from './utility/constants';

const hydrateNavData = galleryData => {
    window.NAV_DATA = window.NAV_DATA || {};
    window.NAV_DATA.currentURL = galleryData.url = 
        window.location.pathname.split('/').filter(next => next).pop();

    if (galleryData[GALLERY_IS_HOME_PAGE]) {
        window.NAV_DATA[GALLERY_IS_HOME_PAGE] = true;
    }

    console.group('hydrateNavData');
    console.log('location path', window.location.pathname.split('/').filter(next => next).pop());
    console.log('NAV_DATA', window.NAV_DATA);
    console.log('galleryData', galleryData);
    console.groupEnd();
};

const hydrateSvgSequence = (() => {
    const dummySequence = ['#ef5c08,0.945,133,110,220,161'];
    const explode = str => {
        if (str[0] === '#') { return str.split(','); }

        console.log('str', str);

        const [color, location] = str.split('|');

        console.log('color', color);
        console.log('LOCATION', location);

        const sequence = location.split(',');
        sequence.unshift('0.4');
        sequence.unshift('#' + color);

        return sequence;
    };
    return seq => (seq || dummySequence).map(explode);
})(); 

const hydrateAlbum = album => {
    const { images, svgSequences } = album;
    for (const image of images) {
        image.id = image.fileName;
        image.svgSequence = hydrateSvgSequence(svgSequences[image.fileName]);
    }
};

const hydrateTitle = albmum => {
    const title = (albmum.title ? albmum.title : '') +
        (albmum.subtitle_A ? ' | ' + albmum.subtitle_A : '');

    if (title) {
        document.title = title;
        const titleBar = document.querySelector('#headerBar .page-header-title');
        titleBar.innerHTML = title;
    }
};


const add11Plus = () => {
    fetch('./album-11-plus.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
        return response.json();
    })
    .then(json => {
        GalleryStore.addImages(json);
    })
    .catch(err => {
        console.log('fetch error', err);
    });
};

const composeStartup = App => albumData => {

    if (!albumData) {
        console.error('GalleryData not found');
        return;
    }

    console.group('composeStartup');
    console.log('albumData', albumData);
    console.groupEnd();

    hydrateTitle(albumData);
    hydrateAlbum(albumData);
    hydrateNavData(albumData);

    GalleryStore.set(albumData);

    // eslint-disable-next-line no-unused-vars
    const app = new App({
        target: document.getElementById('mainApp'),
        props: {}
    });

    setTimeout(add11Plus, 500);
};

export default composeStartup;
