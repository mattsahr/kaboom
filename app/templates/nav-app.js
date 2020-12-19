import Nav from './Nav.svelte';
import NavStore from './store/nav-store';

const hydrateSharedData = navData => {
    const categories = [];

    for (const album of navData.albums) {
        for (const cat of album.navCategories) {
            if (!categories.includes(cat)) {
                categories.push(cat);
            }
        }
    }

    window.NAV_DATA = window.NAV_DATA || {};
    window.NAV_DATA.categories = categories;

};

const NavApp = navData => {

    if (!navData) {
        console.error('navData not found');
        return;
    }

    NavStore.set(navData);
    hydrateSharedData(navData);

    console.log('navApp Started!');
    const urls = [];
    for (const next of navData.albums) {
        if (urls.includes(next.url)) {
            console.log('DUPE!', next.url);
        } else {
            urls.push(next.url);
        }
    }
    console.log('navData', navData);

    // eslint-disable-next-line no-unused-vars
    const navApp = new Nav({
        target: document.getElementById('navApp'),
        props: {}
    });


};

window.NavApp = NavApp;
