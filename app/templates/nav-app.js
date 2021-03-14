import Nav from './Nav.svelte';
import NavStore from './store/nav-store';
import { GALLERY_IS_HOME_PAGE } from './utility/constants';

const hydrateSharedData = navData => {
    const categories = [];

    for (const album of navData.albums) {
        if (Array.isArray(album.navCategories)) {
            for (const cat of album.navCategories) {
                if (!categories.includes(cat)) {
                    categories.push(cat);
                }
            }
        }
    }

    console.log('hydrateSharedData', navData);

    window.NAV_DATA = window.NAV_DATA || {};
    window.NAV_DATA.categories = categories;
    window.NAV_DATA.NAV_ROOT = navData.navRoot;

};

const NavApp = navData => {

    if (!navData) {
        console.error('navData not found');
        return;
    }

    if (window.NAV_DATA) {
        if (window.NAV_DATA[GALLERY_IS_HOME_PAGE]) {
            navData[GALLERY_IS_HOME_PAGE] = true;
        }
        if (window.NAV_DATA.currentURL) {
            navData.currentURL = window.NAV_DATA.currentURL;
        }
    }

    console.log('navData!', navData);

    NavStore.set(navData);
    hydrateSharedData(navData);

    const urls = [];
    for (const next of navData.albums) {
        if (urls.includes(next.url)) {
            console.log('DUPE!', next.url);
        } else {
            urls.push(next.url);
        }
    }

    // eslint-disable-next-line no-unused-vars
    const navApp = new Nav({
        target: document.getElementById('navApp'),
        props: {}
    });

};

window.NavApp = NavApp;
